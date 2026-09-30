import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.static(path.resolve(__dirname, 'public')));

// Helper to get Mercado Pago Token from Secrets / Env
function getMercadoPagoToken(): string | undefined {
  const token =
    process.env.MERCADO_PAGO_ACCESS_TOKEN ||
    process.env.MERCADOPAGO_ACCESS_TOKEN ||
    process.env.MP_ACCESS_TOKEN;
  if (!token) return undefined;
  const trimmed = token.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

// 1. GET /api/pix/config - Check if Mercado Pago Secret is configured
app.get('/api/pix/config', (req, res) => {
  const token = getMercadoPagoToken();
  res.json({
    hasMercadoPago: Boolean(token),
    tokenPrefix: token ? `${token.substring(0, 8)}...` : null,
    officialPixKey: '11954522974',
    officialPixName: 'MEU PEQUENO GRANDE AMIGO',
    officialPixCity: 'OSASCO'
  });
});

// 2. POST /api/pix/create-payment - Create a PIX payment via Mercado Pago
app.post('/api/pix/create-payment', async (req, res) => {
  try {
    const { amount, payerEmail, payerName, donorPhone } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor inválido para doação via PIX.'
      });
    }

    const token = getMercadoPagoToken();

    if (!token) {
      return res.json({
        success: false,
        hasMercadoPago: false,
        message: 'MERCADO_PAGO_ACCESS_TOKEN não configurado nas Secrets do ambiente.',
        mode: 'static_fallback'
      });
    }

    // Split payerName into first and last name if provided
    let firstName = 'Doador';
    let lastName = 'Solidário';
    if (payerName && typeof payerName === 'string' && payerName.trim().length > 0) {
      const parts = payerName.trim().split(' ');
      firstName = parts[0] || 'Doador';
      lastName = parts.slice(1).join(' ') || 'Solidário';
    }

    const cleanEmail =
      payerEmail && typeof payerEmail === 'string' && payerEmail.includes('@')
        ? payerEmail.trim()
        : 'doador@meupequenograndeamigo.org';

    const idempotencyKey = crypto.randomUUID();

    const mpPayload = {
      transaction_amount: Number(numericAmount.toFixed(2)),
      description: `Doação Campanha Dia das Crianças - Meu Pequeno Grande Amigo (R$ ${numericAmount},00)`,
      payment_method_id: 'pix',
      payer: {
        email: cleanEmail,
        first_name: firstName,
        last_name: lastName
      },
      metadata: {
        campaign: 'dia_das_criancas_2024',
        donor_phone: donorPhone || '',
        created_at: new Date().toISOString()
      }
    };

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify(mpPayload)
    });

    const data: any = await mpResponse.json();

    if (!mpResponse.ok) {
      console.warn('Mercado Pago API error:', data);
      return res.status(mpResponse.status).json({
        success: false,
        hasMercadoPago: true,
        error: data.message || 'Erro ao processar pagamento com o Mercado Pago.',
        details: data.cause || data,
        mode: 'static_fallback'
      });
    }

    const qrCode = data.point_of_interaction?.transaction_data?.qr_code;
    const qrCodeBase64 = data.point_of_interaction?.transaction_data?.qr_code_base64;
    const ticketUrl = data.point_of_interaction?.transaction_data?.ticket_url;

    res.json({
      success: true,
      hasMercadoPago: true,
      mode: 'mercadopago',
      paymentId: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      amount: data.transaction_amount,
      qrCode,
      qrCodeBase64,
      ticketUrl,
      expirationDate: data.date_of_expiration
    });
  } catch (error: any) {
    console.error('Error creating Mercado Pago payment:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno ao criar pagamento PIX.'
    });
  }
});

// 2.5 POST /api/pix/create-preference - Create a Mercado Pago Checkout preference for direct payment
app.post('/api/pix/create-preference', async (req, res) => {
  try {
    const { amount, payerEmail, payerName } = req.body;
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valor inválido para o pagamento.'
      });
    }

    const token = getMercadoPagoToken();

    if (!token) {
      return res.json({
        success: false,
        hasMercadoPago: false,
        message: 'MERCADO_PAGO_ACCESS_TOKEN não configurado.',
        mode: 'static_fallback'
      });
    }

    let firstName = 'Doador';
    let lastName = 'Solidário';
    if (payerName && typeof payerName === 'string' && payerName.trim().length > 0) {
      const parts = payerName.trim().split(' ');
      firstName = parts[0] || 'Doador';
      lastName = parts.slice(1).join(' ') || 'Solidário';
    }

    const cleanEmail =
      payerEmail && typeof payerEmail === 'string' && payerEmail.includes('@')
        ? payerEmail.trim()
        : 'doador@meupequenograndeamigo.org';

    const preferencePayload = {
      items: [
        {
          title: `Doação Campanha Dia das Crianças - Meu Pequeno Grande Amigo (R$ ${numericAmount},00)`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: Number(numericAmount.toFixed(2))
        }
      ],
      payer: {
        email: cleanEmail,
        name: firstName,
        surname: lastName
      },
      payment_methods: {
        default_payment_method_id: 'pix'
      },
      metadata: {
        campaign: 'dia_das_criancas_2024'
      }
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preferencePayload)
    });

    const data: any = await mpResponse.json();

    if (!mpResponse.ok) {
      console.warn('Mercado Pago Preference API error:', data);
      return res.status(mpResponse.status).json({
        success: false,
        error: data.message || 'Erro ao criar preferência no Mercado Pago.',
        details: data
      });
    }

    res.json({
      success: true,
      preferenceId: data.id,
      initPoint: data.init_point,
      sandboxInitPoint: data.sandbox_init_point
    });
  } catch (error: any) {
    console.error('Error creating Mercado Pago preference:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno ao criar preferência de pagamento.'
    });
  }
});

// 3. GET /api/pix/status/:paymentId - Check status of Mercado Pago payment
app.get('/api/pix/status/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const token = getMercadoPagoToken();

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'MERCADO_PAGO_ACCESS_TOKEN não configurado.'
      });
    }

    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!mpResponse.ok) {
      const errData = await mpResponse.json();
      return res.status(mpResponse.status).json({
        success: false,
        error: 'Falha ao consultar status do pagamento no Mercado Pago.',
        details: errData
      });
    }

    const data: any = await mpResponse.json();

    res.json({
      success: true,
      paymentId: data.id,
      status: data.status, // 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back'
      statusDetail: data.status_detail,
      isApproved: data.status === 'approved',
      amount: data.transaction_amount,
      dateApproved: data.date_approved
    });
  } catch (error: any) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Erro interno ao consultar status do pagamento.'
    });
  }
});

// 3.5 GET /api/pix/check-recent - Search recently approved payments matching amount
app.get('/api/pix/check-recent', async (req, res) => {
  try {
    const token = getMercadoPagoToken();
    const amount = Number(req.query.amount);

    if (!token) {
      return res.json({ success: false, isApproved: false, message: 'Token não configurado' });
    }

    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!mpResponse.ok) {
      return res.json({ success: true, isApproved: false });
    }

    const data: any = await mpResponse.json();
    const results = data.results || [];

    // Check if any recent payment (last 30 minutes) is approved matching amount
    const now = Date.now();
    const match = results.find((p: any) => {
      const isApp = p.status === 'approved';
      const isCloseTime = (now - new Date(p.date_created).getTime()) < 30 * 60 * 1000;
      const isCloseAmount = !amount || Math.abs(Number(p.transaction_amount) - amount) < 0.05;
      return isApp && isCloseTime && isCloseAmount;
    });

    if (match) {
      return res.json({
        success: true,
        isApproved: true,
        paymentId: match.id,
        status: match.status,
        amount: match.transaction_amount,
        dateApproved: match.date_approved
      });
    }

    res.json({
      success: true,
      isApproved: false
    });
  } catch (err: any) {
    console.error('Error checking recent payments:', err);
    res.json({ success: false, isApproved: false });
  }
});

// 4. POST /api/pix/webhook - Webhook notifications from Mercado Pago
app.post('/api/pix/webhook', async (req, res) => {
  try {
    const { type, data, action } = req.body;
    console.log('Mercado Pago Webhook event received:', { type, action, data });
    // Acknowledge receipt to Mercado Pago
    res.status(200).send('OK');
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    res.status(200).send('OK');
  }
});

// 5. GET /api/firebase/config - Public Firebase client config
app.get('/api/firebase/config', (req, res) => {
  try {
    const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return res.json(config);
    }
  } catch (err) {
    console.error('Error reading firebase config file:', err);
  }
  res.json({
    projectId: 'gen-lang-client-0314814703',
    authDomain: 'gen-lang-client-0314814703.firebaseapp.com',
    storageBucket: 'gen-lang-client-0314814703.firebasestorage.app',
    messagingSenderId: '119888390353',
    appId: '1:119888390353:web:847546db10c693b3ce7df0',
  });
});

// 6. POST /api/firebase/pledge - Backend logging / proxy for donation pledges
app.post('/api/firebase/pledge', (req, res) => {
  try {
    const pledge = req.body;
    console.log('New pledge received by server:', pledge);
    res.json({ success: true, message: 'Pledge registered successfully', pledgeId: pledge.id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. GET /api/download-project - Download complete project zip
app.get('/api/download-project', (req, res) => {
  const zipPath = path.resolve(__dirname, 'public', 'projeto-meu-pequeno-grande-amigo.zip');
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, 'projeto-meu-pequeno-grande-amigo.zip', (err) => {
      if (err && !res.headersSent) {
        res.status(500).send('Erro ao baixar arquivo');
      }
    });
  } else {
    res.status(404).send('Arquivo zip não encontrado.');
  }
});

// Setup Vite middleware in dev or static files in production
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (Production: ${isProduction})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

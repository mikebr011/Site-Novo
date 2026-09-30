import { Child, DropPoint, GalleryPhoto, TimelineMilestone } from '../types';

export const APP_CONFIG = {
  name: 'Meu Pequeno Grande Amigo',
  tagline: 'Entrega de doces e kits para crianças carentes no dia 12 de outubro',
  dateBadge: '12 DE OUTUBRO',
  mainDeliveryDate: '12 de outubro, 9h às 17h',
  location: 'Osasco - SP (Jardim Aliança, Rochdale e Região)',
  email: 'michaelorocha1@gmail.com',
  whatsapp: '+55 (11) 954522974',
  whatsappRaw: '5511954522974',
  pixKey: '11954522974',
  pixKeyType: 'Chave PIX Oficial (E-mail)',
  pixQrCodeUrl: '/qrcode.png',
  pixPayload: '00020126330014BR.GOV.BCB.PIX0111119545229745204000053039865802BR5924MEU PEQUENO GRANDE AMIGO6006OSASCO62070503***63048CF3',
  logoUrl: '/logo.svg',
  heroMainImage: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1200&q=80'
};

export const HERO_SLIDES = [
  {
    url: '/galeria/img-01.jpg',
    fallbackUrl: 'https://i.ibb.co/zhS8z9bK/486638554-674741121604853-7303874116760454890-n.jpg',
    title: 'Cama Elástica & Recreação na Rua',
    subtitle: 'Crianças pulando no pula-pula com voluntário palhaço e muita animação'
  },
  {
    url: '/galeria/img-02.jpg',
    fallbackUrl: 'https://i.ibb.co/svwNWCgw/486639447-674740928271539-3384439598412718956-n.jpg',
    title: 'Entrega de Bolas e Kits Especiais',
    subtitle: 'Mães e crianças reunidas recebendo presentes e saquinhos de doces'
  },
  {
    url: '/galeria/img-03.jpg',
    fallbackUrl: 'https://i.ibb.co/B5BhYcSm/486719700-674740798271552-3369407652001755096-n.jpg',
    title: 'Festa Comunitária nas Ruas de Osasco',
    subtitle: 'Rua cheia de famílias reunidas para um Dia das Crianças inesquecível'
  },
  {
    url: '/galeria/img-04.jpg',
    fallbackUrl: 'https://i.ibb.co/rftC0pP0/486760942-674741134938185-8048307764656401783-n.jpg',
    title: 'Voluntárias no Cachorro-Quente & Lanches',
    subtitle: 'Equipe com a camiseta oficial servindo cachorro-quente no caldeirão e refrigerante'
  },
  {
    url: '/galeria/img-05.jpg',
    fallbackUrl: 'https://i.ibb.co/84XcLwvN/486789202-674740818271550-4213364170777336574-n.jpg',
    title: 'Refrigerante Geladinho & Guloseimas',
    subtitle: 'Bancada de bebidas servidas com carinho pelas voluntárias'
  },
  {
    url: '/galeria/img-06.jpg',
    fallbackUrl: 'https://i.ibb.co/mFb9dCkt/486832768-674741084938190-765998869085316434-n.jpg',
    title: 'Brincadeiras e Diversão na Rua',
    subtitle: 'Animação e recreação ao ar livre durante o Dia das Crianças'
  },
  {
    url: '/galeria/img-07.jpg',
    fallbackUrl: 'https://i.ibb.co/5gSq4CGk/487028882-674741231604842-211499102830922006-n.jpg',
    title: 'Confraternização com a Comunidade',
    subtitle: 'Famílias reunidas e união comunitária em celebração'
  },
  {
    url: '/galeria/img-08.jpg',
    fallbackUrl: 'https://i.ibb.co/FbB9Y0b8/487219304-674741111604854-2378416831214969347-n.jpg',
    title: 'Distribuição de Pastéis e Comida Quentinha',
    subtitle: 'Entrega direta para as famílias nas ruas de Osasco'
  },
  {
    url: '/galeria/img-09.jpg',
    fallbackUrl: 'https://i.ibb.co/YB0Z5CzX/487221587-674739734938325-6079613514342653034-n.jpg',
    title: 'Equipe de Voluntários e Apoio Solidário',
    subtitle: 'Organização e dedicação para atender cada família com carinho'
  },
  {
    url: '/galeria/img-10.jpg',
    fallbackUrl: 'https://i.ibb.co/jknrN8wd/487477770-675597504852548-7631777022302260271-n.jpg',
    title: 'Sorrisos e Brinquedos de Presente',
    subtitle: 'Felicidade estampada no rosto das crianças ao receber os presentes'
  }
];

export const INITIAL_CHILDREN: Child[] = [
  {
    id: 'c-1',
    childName: 'Lucas Gabriel',
    age: 6,
    gender: 'Menino',
    guardianName: 'Mariana S. Silva',
    guardianPhone: '(11) 98765-4321',
    neighborhood: 'Jardim Primavera',
    toyPreference: 'Carrinhos / Pistas',
    wishDetails: 'Adora brincar de corrida e sonha em ter um caminhão de bombeiro ou carrinho de controle remoto.',
    status: 'aguardando',
    protocolNumber: 'MPGA-2024-001',
    createdAt: '2024-09-01'
  },
  {
    id: 'c-2',
    childName: 'Sophia Emanuelly',
    age: 4,
    gender: 'Menina',
    guardianName: 'Juliana P. Castro',
    guardianPhone: '(11) 97654-3210',
    neighborhood: 'Vila Esperança',
    toyPreference: 'Bonecas / Acessórios',
    wishDetails: 'Gosta muito de cuidar de bonecas bebês e bichinhos de pelúcia com mamadeira.',
    status: 'aguardando',
    protocolNumber: 'MPGA-2024-002',
    createdAt: '2024-09-02'
  },
  {
    id: 'c-3',
    childName: 'Enzo Miguel',
    age: 8,
    gender: 'Menino',
    guardianName: 'Carlos Eduardo Santos',
    guardianPhone: '(11) 96543-2109',
    neighborhood: 'Parque das Flores',
    toyPreference: 'Jogos de Tabuleiro / Lego',
    wishDetails: 'Muito curioso e esperto, gosta de blocos de montar, dinossauros e quebra-cabeças.',
    status: 'aguardando',
    protocolNumber: 'MPGA-2024-003',
    createdAt: '2024-09-03'
  },
  {
    id: 'c-4',
    childName: 'Valentina Vitória',
    age: 5,
    gender: 'Menina',
    guardianName: 'Fernanda R. Lima',
    guardianPhone: '(11) 95432-1098',
    neighborhood: 'Jardim das Acácias',
    toyPreference: 'Bichos de Pelúcia / Desenho',
    wishDetails: 'Sonha com uma pelúcia de ursinho fofinho e kit com lápis de cor e livrinho de colorir.',
    status: 'apadrinhado',
    protocolNumber: 'MPGA-2024-004',
    createdAt: '2024-09-04',
    sponsorName: 'Família Albuquerque'
  },
  {
    id: 'c-5',
    childName: 'Davi Lucca',
    age: 7,
    gender: 'Menino',
    guardianName: 'Aline M. Barbosa',
    guardianPhone: '(11) 94321-0987',
    neighborhood: 'Bairro Santa Luzia',
    toyPreference: 'Bola de Futebol / Esportes',
    wishDetails: 'Adora futebol e sonha com uma bola nova ou jogo de esportes para jogar com os primos.',
    status: 'aguardando',
    protocolNumber: 'MPGA-2024-005',
    createdAt: '2024-09-05'
  },
  {
    id: 'c-6',
    childName: 'Isabella Cristina',
    age: 3,
    gender: 'Menina',
    guardianName: 'Renata O. Souza',
    guardianPhone: '(11) 93210-9876',
    neighborhood: 'Vila Nova',
    toyPreference: 'Brinquedos Musicais / Formas',
    wishDetails: 'Pequena e alegre, gosta de brinquedos com sons e encaixes de formas coloridas.',
    status: 'apadrinhado',
    protocolNumber: 'MPGA-2024-006',
    createdAt: '2024-09-06',
    sponsorName: 'Dra. Beatriz Mendes'
  }
];

export const DROP_POINTS: DropPoint[] = [
  {
    id: 'dp-1',
    name: 'Ponto Central - Centro Comunitário',
    address: 'Rua das Acácias, 120 - Jardim das Acácias',
    neighborhood: 'Centro / Jardim das Acácias',
    hours: 'Segunda a Sábado, das 08h às 18h',
    contactPhone: '(11) 95452-2974',
    responsiblePerson: 'Coordenação Meu Pequeno Grande Amigo',
    mapsQuery: 'Rua das Acácias, 120'
  },
  {
    id: 'dp-2',
    name: 'Igreja Santa Rita de Cássia',
    address: 'Av. Paulista das Flores, 450 - Parque das Flores',
    neighborhood: 'Parque das Flores',
    hours: 'Terça a Domingo, das 09h às 17h',
    contactPhone: '(11) 98822-1133',
    responsiblePerson: 'Pastoral Comunitária',
    mapsQuery: 'Av. Paulista das Flores, 450'
  },
  {
    id: 'dp-3',
    name: 'Escola Aquarela Kids & Coworking',
    address: 'Rua dos Girassóis, 89 - Vila Esperança',
    neighborhood: 'Vila Esperança',
    hours: 'Segunda a Sexta, das 07h30 às 19h',
    contactPhone: '(11) 97711-4455',
    responsiblePerson: 'Profa. Cláudia e Equipe',
    mapsQuery: 'Rua dos Girassóis, 89'
  },
  {
    id: 'dp-4',
    name: 'Studio & Academia Corpo em Movimento',
    address: 'Rua Almirante Barroso, 310 - Jardim Primavera',
    neighborhood: 'Jardim Primavera',
    hours: 'Segunda a Sexta, das 06h às 21h | Sáb 08h às 14h',
    contactPhone: '(11) 99933-7788',
    responsiblePerson: 'Marcelo e Amanda',
    mapsQuery: 'Rua Almirante Barroso, 310'
  }
];

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    year: '2014',
    title: 'O Primeiro Passo',
    description: 'Um grupo de 5 amigos se reuniu para arrecadar 50 brinquedos para crianças de uma creche comunitária local.',
    stat: '50+',
    statLabel: 'Crianças presenteadas'
  },
  {
    year: '2017',
    title: 'Expansão Comunitária',
    description: 'Criação dos primeiros pontos de coleta nos comércios parceiros e envolvimento de mais de 30 voluntários dedicados.',
    stat: '350+',
    statLabel: 'Brinquedos arrecadados'
  },
  {
    year: '2020',
    title: 'Solidariedade em Tempos Difíceis',
    description: 'Adaptação dos kits com álcool em gel, higienização rigorosa e entregas porta a porta em bairros vulneráveis.',
    stat: '800+',
    statLabel: 'Famílias acolhidas'
  },
  {
    year: '2023',
    title: 'Uma Década de Amor',
    description: 'Comemoração de 10 anos com grande festa comunitária, pintura facial, pipoca, teatro e entrega de presentes para 4 bairros.',
    stat: '1.450+',
    statLabel: 'Presentes entregues'
  },
  {
    year: '2024',
    title: 'Campanha Atual: 2.000 Sorrisos',
    description: 'Meta ampliada para alcançar 2.000 crianças cadastradas em 8 bairros da cidade no dia 12 de outubro.',
    stat: '2.000',
    statLabel: 'Meta deste ano'
  }
];

export const GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'g-1',
    url: '/galeria/img-01.jpg',
    fallbackUrl: 'https://i.ibb.co/zhS8z9bK/486638554-674741121604853-7303874116760454890-n.jpg',
    filename: 'img-01.jpg',
    title: 'Cama Elástica & Recreação com Palhaço',
    subtitle: 'Brincadeiras e muita diversão na rua',
    description: 'Crianças pulando com alegria no pula-pula com voluntário caracterizado de palhaço durante a festa comunitária em Osasco.',
    category: 'sorrisos',
    year: '2024'
  },
  {
    id: 'g-2',
    url: '/galeria/img-02.jpg',
    fallbackUrl: 'https://i.ibb.co/svwNWCgw/486639447-674740928271539-3384439598412718956-n.jpg',
    filename: 'img-02.jpg',
    title: 'Entrega de Bolas e Kits Decorados',
    subtitle: 'Mães e crianças reunidas aguardando presentes',
    description: 'Momento emocionante com a entrega de bolas coloridas e saquinhos de doces especiais para a garotada.',
    category: 'brinquedos',
    year: '2024'
  },
  {
    id: 'g-3',
    url: '/galeria/img-03.jpg',
    fallbackUrl: 'https://i.ibb.co/B5BhYcSm/486719700-674740798271552-3369407652001755096-n.jpg',
    filename: 'img-03.jpg',
    title: 'Festa Comunitária nas Ruas de Osasco',
    subtitle: 'Rua cheia de famílias reunidas para a comemoração',
    description: 'Visão ampla da rua repleta de crianças, brinquedos infláveis, cama elástica, música e voluntários unidos pelo bem.',
    category: 'entregas',
    year: '2024'
  },
  {
    id: 'g-4',
    url: '/galeria/img-04.jpg',
    fallbackUrl: 'https://i.ibb.co/rftC0pP0/486760942-674741134938185-8048307764656401783-n.jpg',
    filename: 'img-04.jpg',
    title: 'Voluntárias no Cachorro-Quente & Lanches',
    subtitle: 'Equipe com camiseta oficial preparando os lanches',
    description: 'Voluntárias com aventais coloridos e camisetas oficiais do projeto ao lado do caldeirão de salsicha servindo cachorro-quente e refrigerante.',
    category: 'voluntarios',
    year: '2024'
  },
  {
    id: 'g-5',
    url: '/galeria/img-05.jpg',
    fallbackUrl: 'https://i.ibb.co/84XcLwvN/486789202-674740818271550-4213364170777336574-n.jpg',
    filename: 'img-05.jpg',
    title: 'Copinhos de Refrigerante & Saquinhos de Doces',
    subtitle: 'Bebidas servidas na hora para refrescar o dia',
    description: 'Bancada montada com dezenas de copos de refrigerante e distribuição contínua de lanches para as crianças.',
    category: 'voluntarios',
    year: '2024'
  },
  {
    id: 'g-6',
    url: '/galeria/img-06.jpg',
    fallbackUrl: 'https://i.ibb.co/mFb9dCkt/486832768-674741084938190-765998869085316434-n.jpg',
    filename: 'img-06.jpg',
    title: 'Brincadeiras e Diversão na Rua',
    subtitle: 'Animação e recreação ao ar livre durante o Dia das Crianças',
    description: 'Recreação infantil e alegria contagiante de voluntários e pequenos celebrando na comunidade.',
    category: 'sorrisos',
    year: '2024'
  },
  {
    id: 'g-7',
    url: '/galeria/img-07.jpg',
    fallbackUrl: 'https://i.ibb.co/5gSq4CGk/487028882-674741231604842-211499102830922006-n.jpg',
    filename: 'img-07.jpg',
    title: 'Confraternização com a Comunidade',
    subtitle: 'Famílias reunidas e união comunitária em celebração',
    description: 'Encontro caloroso com as famílias locais, fortalecendo laços e celebrando a infância em Osasco.',
    category: 'entregas',
    year: '2024'
  },
  {
    id: 'g-8',
    url: '/galeria/img-08.jpg',
    fallbackUrl: 'https://i.ibb.co/FbB9Y0b8/487219304-674741111604854-2378416831214969347-n.jpg',
    filename: 'img-08.jpg',
    title: 'Distribuição de Pastéis e Comida Quentinha',
    subtitle: 'Entrega direta para as famílias nas ruas de Osasco',
    description: 'Voluntários distribuindo pastéis e lanches quentinhos direto das caixas térmicas para os moradores e crianças.',
    category: 'entregas',
    year: '2024'
  },
  {
    id: 'g-9',
    url: '/galeria/img-09.jpg',
    fallbackUrl: 'https://i.ibb.co/YB0Z5CzX/487221587-674739734938325-6079613514342653034-n.jpg',
    filename: 'img-09.jpg',
    title: 'Equipe de Voluntários e Apoio Solidário',
    subtitle: 'Organização e dedicação para atender cada família com carinho',
    description: 'Apoio logístico e dedicação dos voluntários em cada etapa para garantir uma festa impecável e acolhedora.',
    category: 'voluntarios',
    year: '2024'
  },
  {
    id: 'g-10',
    url: '/galeria/img-10.jpg',
    fallbackUrl: 'https://i.ibb.co/jknrN8wd/487477770-675597504852548-7631777022302260271-n.jpg',
    filename: 'img-10.jpg',
    title: 'Sorrisos e Brinquedos de Presente',
    subtitle: 'Felicidade ao receber brinquedos novos',
    description: 'Criança sorridente recebendo kit com raquete de brinquedo e doces, transformando o Dia das Crianças com afeto.',
    category: 'brinquedos',
    year: '2024'
  }
];

export const FAQS = [
  {
    q: 'O que contém cada kit entregue às crianças?',
    a: 'Os kits são preparados com muito carinho e dedicação pelos voluntários, contendo itens deliciosos e bem recheados: bolo fresquinho, lanche saboroso, refrigerante e, claro, bastantes doces e guloseimas para celebrar o Dia das Crianças!'
  },
  {
    q: 'Onde e como é feita a distribuição dos doces?',
    a: 'A distribuição é realizada diretamente nas ruas e comunidades por voluntários no dia 12 de outubro, atendendo bairros como Jardim Aliança e Rochdale na cidade de Osasco, seguindo todos os protocolos responsáveis de cuidado e proteção.'
  },
  {
    q: 'Como posso me cadastrar como doador do projeto?',
    a: 'Basta acessar a página "Seja Doador" no menu superior, preencher seu nome e telefone para que nossa equipe entre em contato, ou realizar uma doação direta via PIX nos valores sugeridos de R$ 30, R$ 50 ou R$ 100.'
  },
  {
    q: 'Como o grupo de voluntários se organiza para a ação?',
    a: 'O projeto "Meu Pequeno Grande Amigo" é formado por um grupo de amigos unidos pelo propósito nobre de levar alegria. Anualmente, realizam a arrecadação de guloseimas por conta própria e contam com o apoio de doadores solidários.'
  },
  {
    q: 'Até quando posso realizar as doações para a campanha deste ano?',
    a: 'As doações podem ser feitas até o dia 08 de outubro, permitindo tempo hábil para a compra dos ingredientes, preparo dos kits e organização das rotas de distribuição antes do dia 12 de outubro.'
  }
];

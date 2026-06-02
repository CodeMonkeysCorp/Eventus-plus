# Eventus+
1. Projeto do grupo:
 P09-A - Eventos: Inscrição e presença.
2. Nomes dos integrantes do grupo:
José Henrique Brühmüller
Matheus Büsemayer
André Schultz
Lucas Monich Nunes
3. Descrição curta do sistema:
 O Eventus+ será um sistema web para gerenciamento de eventos acadêmicos fictícios, permitindo o cadastro de eventos, inscrição de participantes, controle de presença por check-in, emissão de certificados fictícios e geração de relatórios administrativos. O sistema terá autenticação, autorização por perfil, controle de acesso aos dados, banco de dados, validações no servidor e logs de auditoria para ações relevantes.
4. Stack pretendida:
Front-end: Angular
Back-end: Spring Boot com Java 17
Banco de dados: MySQL
Controle de versão: GitHub
Segurança: autenticação com login e senha, senhas com hash, autorização por perfil, validação no back-end, proteção de variáveis de ambiente e logs de auditoria.
5. Perfis de usuário previstos:
Participante: poderá criar conta, visualizar eventos disponíveis, realizar inscrições, consultar suas inscrições, verificar presença e acessar certificados fictícios quando aplicável.
Operador: poderá acompanhar inscrições, realizar check-in dos participantes, validar presença e atualizar status de participação em eventos.
Administrador: poderá gerenciar eventos, usuários, perfis, inscrições, relatórios e logs de auditoria.
A escolha desses três perfis atende à exigência de pelo menos três perfis de acesso e permite demonstrar controle por perfil e por responsabilidade dentro do sistema.
6. Funcionalidades mínimas previstas:
Cadastro e autenticação de usuários;
Controle de acesso por perfil;
CRUD de eventos;
Inscrição de participantes em eventos;
Consulta das próprias inscrições pelo participante;
Check-in de presença por operador ou administrador;
Registro de certificado fictício para participantes presentes;
Consulta administrativa de inscrições e presenças;
Geração de relatórios de eventos, inscrições e presença;
Logs de auditoria para login, criação/edição de eventos, inscrição, check-in, ações administrativas e tentativas de acesso negado;
Validação dos dados no back-end;
Uso de .env.example e proteção de credenciais fora do GitHub.


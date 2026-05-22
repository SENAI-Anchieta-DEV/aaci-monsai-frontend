describe('Fluxo 4: Navegação e Matriz de Permissões (Role-Based Access)', () => {
  const login = (email, senha) => {
    cy.visit('http://localhost:3000');
    cy.contains('Sou Cliente').click();
    cy.get('input[type="text"]').clear().type(email);
    cy.get('input[type="password"]').clear().type(senha);
    cy.get('button').contains('Entrar').click();
    cy.contains('MONSAI — Painel').should('be.visible', { timeout: 10000 });
    cy.get('[aria-label="Abrir menu"]').click();
  };

  // ⚠️ AJUSTE OS E-MAILS ABAIXO DE ACORDO COM O SEU BANCO DE DADOS LOCAL
  it('GESTOR: Deve ver Gerenciamento, Cadastros e Monitoramento', () => {
    login('gestor@monsai.com', '123456');
    cy.contains('Monitoramento').should('be.visible');
    cy.contains('Cadastrar Usuário').should('be.visible');
    cy.contains('Gerenciar Usuários').should('be.visible');
    cy.contains('Cadastrar Idoso').should('be.visible');
    cy.contains('Gerenciar Unidades').should('not.exist'); // Apenas Super Admin
  });

  it('CUIDADOR: Não deve ver cadastro de usuários', () => {
    login('cuidador@monsai.com', '123456');
    cy.contains('Monitoramento').should('be.visible');
    cy.contains('Cadastrar Idoso').should('be.visible');
    cy.contains('Histórico de Alertas').should('be.visible');
    cy.contains('Cadastrar Usuário').should('not.exist');
    cy.contains('Gerenciar Usuários').should('not.exist');
  });

  it('ENFERMEIRO: Deve ver apenas leitura de saúde', () => {
    login('enfermeiro@monsai.com', '123456');
    cy.contains('Monitoramento').should('be.visible');
    cy.contains('Histórico de Alertas').should('be.visible');
    cy.contains('Cadastrar Idoso').should('not.exist');
  });

  it('FAMILIAR: Visão restrita do parente', () => {
    login('familiarjose@monsai.com', '123456');
    cy.contains('Monitoramento').should('be.visible');
    cy.contains('Localizar Idoso').should('be.visible');
    cy.contains('Cadastrar Usuário').should('not.exist');
  });
});
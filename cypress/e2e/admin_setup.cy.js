describe('Fluxo 1: AdminSetup - Cadastro de Unidade e Gestor', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Deve logar como SUPER_ADMIN e realizar o Onboarding de um novo Asilo', () => {
    cy.contains('Sou Cliente').click();
    
    // Login do Super Admin
    cy.get('input[type="text"]').type('admin@monsai.com'); // Ajuste para o email admin do seu DB
    cy.get('input[type="password"]').type('admin123');
    cy.get('button').contains('Entrar').click();

    // Valida redirecionamento para o AdminSetup
    cy.contains('Configuração Inicial de Nova Unidade').should('be.visible');

    // PASSO 1: Dados do Asilo
    cy.get('input[name="nome"], input[type="text"]').first().type('Asilo Recanto da Paz Cypress');
    cy.get('input[name="cnpj"], input[type="text"]').eq(1).type('12345678000199');
    cy.get('input[name="endereco"], input[type="text"]').eq(2).type('Rua das Flores, 123 - São Paulo, SP');
    cy.get('button').contains('Próximo: Cadastrar Gestor').click();

    // Valida transição para o Passo 2
    cy.contains('Passo 2: Cadastro do Gestor Responsável').should('be.visible');

    // PASSO 2: Dados do Gestor
    cy.get('input[type="text"]').eq(0).type('Gestor Responsável Cypress'); // Nome
    cy.get('input[type="text"]').eq(1).type('gestor@monsai.com'); // Email
    cy.get('input[type="text"]').eq(2).type('11122233344'); // CPF
    cy.get('input[type="password"]').type('123456'); // Senha

    cy.get('button').contains('Finalizar e Salvar Unidade').click();
    cy.contains('Configuração finalizada').should('be.visible');
  });
});
describe('Fluxo 3: CRUD e Gerenciamento de Usuários', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.contains('Sou Cliente').click();
    cy.get('input[type="text"]').type('gestor@monsai.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('button').contains('Entrar').click();
  });

  it('Deve acessar o formulário e cadastrar um Cuidador, Enfermeiro e um Familiar', () => {
    cy.get('[aria-label="Abrir menu"]').click();
    cy.contains('Cadastrar Usuário').click();

    // Cuidador
    cy.get('input[name="nome"]').type('Cuidador Cypress');
    cy.get('input[name="cpf"]').type('55544433322');
    
    // Seleciona o Tipo de Acesso
    cy.get('div[role="combobox"]').click();
    cy.get('li[data-value="CUIDADOR"]').click();

    
    cy.get('input[name="email"]').type('cuidador@monsai.com');
    cy.get('input[name="senha"]').type('123456');

    cy.get('button').contains('Finalizar Cadastro').click();

    // Enfermeiro
    cy.get('input[name="nome"]').type('Enfermeiro Cypress');
    cy.get('input[name="cpf"]').type('12389065710');
    
    // Seleciona o Tipo de Acesso
    cy.get('div[role="combobox"]').click();
    cy.get('li[data-value="ENFERMEIRO"]').click();

    cy.get('input[name="email"]').type('enfermeiro@monsai.com');
    cy.get('input[name="senha"]').type('123456');

    cy.get('button').contains('Finalizar Cadastro').click();

    // Familiar
    cy.get('input[name="nome"]').type('Familiar do José Cypress');
    cy.get('input[name="cpf"]').type('31331331323');
    
    // Seleciona o Tipo de Acesso
    cy.get('div[role="combobox"]').click();
    cy.get('li[data-value="FAMILIAR"]').click();

    cy.get('input[name="email"]').type('familiarjose@monsai.com');
    cy.get('input[name="senha"]').type('123456');

    cy.get('button').contains('Finalizar Cadastro').click();
  });

  it('Deve acessar a tela de Gerenciar Usuários e listar os cadastros', () => {
    cy.get('[aria-label="Abrir menu"]').click();
    cy.contains('Gerenciar Usuários').click();

    // Garante que a tabela/lista carregou elementos
    cy.contains('Gerenciar Colaboradores').should('be.visible');
    
    // Verifica se a tabela não está vazia (procura por linhas na tabela)
    cy.get('table').find('tr').its('length').should('be.gt', 1);
  });
});
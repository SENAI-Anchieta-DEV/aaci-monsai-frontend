describe('AACI-222: Tratamento de Erros e Validações de Backend', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.contains('Sou Cliente').click();
  });

  it('Deve tratar erro 401 (Credenciais Inválidas)', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { detail: "Credenciais inválidas. Verifique seu e-mail e senha." }
    }).as('login401');

    cy.get('input[type="text"]').type('errado@monsai.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('button').contains('Entrar').click();

    cy.wait('@login401');
    cy.contains('Email ou senha incorretos').should('be.visible');
  });

  it('Deve tratar erro 409 (Recurso Duplicado - ex: Usuário já cadastrado)', () => {
    // Simulamos um cenário de cadastro de usuário com erro de conflito
    cy.intercept('POST', '**/usuarios', {
      statusCode: 409,
      body: { detail: "Conflito de dados: Já existe um registro no banco com este CPF." }
    }).as('conflictRequest');

    // Simula o login como Gestor para acessar o cadastro
    cy.get('input[type="text"]').type('gestor@monsai.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('button').contains('Entrar').click();
    
    // Navega para cadastro e submete
    cy.get('[aria-label="Abrir menu"]').click();
    cy.contains('Cadastrar Usuário').click();

    cy.get('input[name="nome"]').type('Enfermeiro Cypress');
    cy.get('input[name="cpf"]').type('12389065710');
    
    // Seleciona o Tipo de Acesso
    cy.get('div[role="combobox"]').click();
    cy.get('li[data-value="ENFERMEIRO"]').click();

    cy.get('input[name="email"]').type('enfermeiro@monsai.com');
    cy.get('input[name="senha"]').type('123456');

    cy.get('button').contains('Finalizar Cadastro').click();

    cy.get('button').contains('Finalizar Cadastro').click();

    cy.wait('@conflictRequest');
    cy.contains('Conflito de dados').should('be.visible');
  });

  it('Deve tratar erro 404 (Idoso Não Encontrado)', () => {
    // Simula o login como Gestor para acessar o cadastro
    cy.get('input[type="text"]').type('gestor@monsai.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('button').contains('Entrar').click();
    
    // 2. Digita um termo que certamente não existe
    cy.get('[data-cy="input-pesquisa"]').type('José Cypress 3');

    // 3. Valida se o card sumiu e a mensagem de "Nenhum idoso encontrado" apareceu
    // Isso valida o estado de "Nenhum resultado" do seu componente
    cy.contains('Nenhum idoso encontrado').should('be.visible');
    
    
    // Opcional: Garante que nenhum card de idoso está sendo renderizado na tela
    cy.get('.MuiCard-root').should('not.exist');
  });

  
});
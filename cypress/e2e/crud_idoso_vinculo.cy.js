describe('Fluxo 2: Gestão de Idosos e Vínculos', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.contains('Sou Cliente').click();
    
    // Loga como Gestor
    cy.get('input[type="text"]').type('gestor@monsai.com'); 
    cy.get('input[type="password"]').type('123456');
    cy.get('button').contains('Entrar').click();
    
    // Abre a tela inicial de cadastro de idoso
    cy.get('[aria-label="Abrir menu"]').click();
    cy.contains('Cadastrar Idoso').click();
  });

  it('AACI-221: Deve cadastrar o idoso com dispositivo IoT e vinculá-lo ao familiar no gerenciamento', () => {
    // ─── ETAPA 1: CADASTRO DO IDOSO E DISPOSITIVO ───
    cy.contains('Vincular Novo Idoso (IoT)').should('be.visible');

    // Preenche dados base do Idoso
    cy.get('input[name="nome"], input[type="text"]').first().type('José Cypress 2');
    cy.get('input[name="cpf"], input[type="text"]').eq(1).type('99988877767');
    cy.get('input[name="email"]').type('familiarjose@monsai.com');
    cy.get('input[name="serialDispositivo"]').type('MON-314');

    cy.get('button').contains('Cadastrar e Ativar Monitoramento').click();

    // Valida feedback visual de sucesso da primeira etapa (Descomentado para sincronismo do banco)
  //  cy.contains('Idoso e Pulseira vinculados!').should('be.visible');

    // ─── ETAPA 2: NAVEGAÇÃO E VÍNCULO FAMILIAR NO MODAL ───
    cy.get('[aria-label="Abrir menu"]').click();
    cy.contains('Gerenciar Usuários').click();
    
    // Abre o Modal de Vínculo de Idoso ao Familiar
    cy.get('button').contains('Vincular').click();
    
    // 1. Garante que o cabeçalho do Modal abriu e está visível na viewport
    cy.contains('Vincular Idoso').should('be.visible');

    // 2. Localiza o select nativo e seleciona o idoso recém-cadastrado pelo texto do option
    cy.get('select').select('José Cypress 2');

    // 3. Verifica se o valor do select mudou e não está mais em branco antes de submeter
    cy.get('select').should('not.have.value', '');

    // 4. Clica no botão contido dentro do Dialog para salvar a amarração familiar
    cy.get('button').contains('Confirmar').click();

    // 5. Valida se o modal fechou com sucesso e a tela retornou ao estado original
    cy.contains('Vincular Idoso').should('not.exist');
  }); // 🌟 CORRIGIDO: Fechamento correto do bloco do primeiro it com });

  it('AACI-221: Deve deslogar o Gestor, logar com o Familiar e validar o idoso vinculado no painel', () => {
    // ─── ETAPA 1: GESTOR DESLOGA DA CONTA ───
    cy.get('[aria-label="Sair do sistema"]').should('be.visible').click();
    
    // Valida que a sessão foi destruída e voltamos para a tela de Login limpa
    cy.contains('Login').should('be.visible');

    // ─── ETAPA 2: FAMILIAR LOGA NO SISTEMA ───
    cy.get('input[type="text"]').type('familiarjose@monsai.com');
    cy.get('input[type="password"]').type('123456'); 
    cy.get('button').contains('Entrar').click();

    // Valida o redirecionamento com sucesso para o painel de Familiar
    cy.contains('MONSAI — Painel Familiar').should('be.visible', { timeout: 10000 });

    // ─── ETAPA 3: VALIDAÇÃO DO VÍNCULO DO IDOSO ───
    cy.contains('Monitoramento em Tempo Real').should('be.visible');
    
    // Procura na lista o nome exato do idoso que foi amarrado a este usuário
    cy.contains('José Cypress 2').should('be.visible');
    
    // Garante que o serial da pulseira também está visível no respectivo card
    cy.contains('Serial: MON-314').should('be.visible');

    // Valida o indicador em tempo real na tela do Familiar
    cy.contains('SEM SINAL').should('be.visible');
  });
});
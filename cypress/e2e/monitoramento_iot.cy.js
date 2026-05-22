describe('AACI-221: Monitoramento IoT e Visualização de Alertas', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.contains('Sou Cliente').click();
    
    // Login unificado para a sessão de monitoramento
    cy.get('input[type="text"]').type('gestor@monsai.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('button').contains('Entrar').click();

    // Garante o redirecionamento correto e navega para a Viewport de Telemetria
    cy.contains('MONSAI — Painel').should('be.visible', { timeout: 10000 });
    cy.contains('Monitoramento').click();
  });

  it('AACI-221: Deve renderizar o Alerta Crítico no Monitoramento e listá-lo no Histórico de Alertas', () => {
    // 1. Intercepta o Polling de telemetria simulando uma Queda Crítica no Monitoramento
    cy.intercept('GET', '**/api/telemetria/ultima', {
      statusCode: 200,
      body: {
        "pulseira_id": "MON-314",
        "sinal_vital": {
          "frequencia_cardiaca_bpm": 145,
          "temperatura_c": 39.2,
          "movimento": {
            "queda_detectada": true,
            "aceleracao": { "x": 4.2, "y": 3.1, "z": -2.5 }
          }
        },
        "status_do_dispositivo": {
          "nivel_bateria": 88,
          "status_pulseira": "ATIVO"
        }
      }
    }).as('pollingAlerta');

    cy.wait('@pollingAlerta');
    cy.contains('⚠️ QUEDA DETECTADA!').should('be.visible');

    // 🌟 CORREÇÃO 1: Rota exata que o React chama (alertas-recentes)
    // 🌟 CORREÇÃO 2: Formato exato do payload com 'data', 'visto' e array de 'motivos'
    cy.intercept('GET', '**/api/telemetria/alertas-recentes*', {
      statusCode: 200,
      body: [
        {
          "id": 101,
          "idosoNome": "José Cypress 2",
          "idosoId": 5,
          "data": "2026-05-22T10:40:00",
          "visto": false,
          "motivos": [
            "QUEDA",
            "ALTA",
            "Acelerômetro detectou impacto abrupto"
          ]
        }
      ]
    }).as('fetchHistorico');

    // Abre o menu e navega até a tela de Histórico
    cy.get('[aria-label="Abrir menu"]').click();
    cy.contains('Histórico de Alertas').click();

    // Aguarda a transição de renderização do componente React terminar
    cy.wait(500);

    // Valida que a requisição interceptada foi capturada e respondeu com sucesso
    cy.wait('@fetchHistorico').its('response.statusCode').should('eq', 200);

    // ─── VALIDAÇÃO DOS DADOS DO ALERTA NO HISTÓRICO ───
    cy.contains('Histórico de Alertas Clínicos').should('be.visible');
    
    // Verifica os elementos textuais gerados pelo mock na tela
    cy.contains('José Cypress 2').should('be.visible');
    
    // Agora o Cypress vai achar essas palavras porque elas vão renderizar dentro dos Chips (alerta.motivos)!
    cy.contains('QUEDA').should('be.visible');
    cy.contains('ALTA').should('be.visible');
    cy.contains('Acelerômetro detectou impacto abrupto').should('be.visible');
  });
});
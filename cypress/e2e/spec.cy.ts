describe('New App', () => {
  it('Visits the initial project page', () => {
    cy.visit('/');
    cy.contains('button', /Login|登入/);
  });
});

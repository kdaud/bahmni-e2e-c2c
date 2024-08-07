import { Page } from '@playwright/test';
import { patientName } from './bahmni';
import { ODOO_URL } from '../configs/globalSetup';
import { delay } from './bahmni';

export class Odoo {
  constructor(readonly page: Page) {}

  async open() {
    await this.page.goto(`${ODOO_URL}`);
    await this.page.getByPlaceholder('Email').fill(`${process.env.ODOO_USERNAME}`);
    await this.page.getByPlaceholder('Password').click();
    await this.page.getByPlaceholder('Password').fill(`${process.env.ODOO_PASSWORD}`);
    await this.page.locator('button[type="submit"]').click();
  }

  async searchCustomer() {
    await this.page.locator("//a[contains(@class, 'full')]").click();
    await this.page.getByRole('menuitem', { name: 'Ventes' }).click();
    await this.page.getByPlaceholder('Recherche').fill(`${patientName.firstName + ' ' + patientName.givenName}`);
    await this.page.getByPlaceholder('Recherche').press('Enter');
  }
}

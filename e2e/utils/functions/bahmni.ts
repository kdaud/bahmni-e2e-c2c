import { Page, expect } from '@playwright/test';
import { BAHMNI_URL } from '../configs/globalSetup';

export var patientName = {
  firstName : '',
  givenName : '',
  updatedFirstName : ''
}

var patientFullName = '';

export var randomOpenMRSRoleName = {
  roleName : `Ab${(Math.random() + 1).toString(36).substring(2)}`
}

export const delay = (mills) => {
  let datetime1 = new Date().getTime();
  let datetime2 = datetime1 + mills;
  while(datetime1 < datetime2) {
     datetime1 = new Date().getTime();
    }
}

export class Bahmni {
  constructor(readonly page: Page) {}

  readonly patientSearchIcon = () => this.page.locator('[data-testid="searchPatientIcon"]');
  readonly patientSearchBar = () => this.page.locator('[data-testid="patientSearchBar"]');

  async login() {
    await this.page.goto(`${process.env.BAHMNI_URL_DEV}`);
    await this.page.locator('#username').fill(`${process.env.BAHMNI_USERNAME}`);
    await this.page.locator('#password').fill(`${process.env.BAHMNI_PASSWORD}`);
    await this.page.getByLabel('Location *').selectOption('object:7');
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async createPatient() {
    patientName = {
      firstName : `e2e_test_${Math.floor(Math.random() * 10000)}`,
      givenName : `${(Math.random() + 1).toString(36).substring(2)}`,
      updatedFirstName: `${(Math.random() + 1).toString(36).substring(2)}`
    }
    patientFullName = patientName.firstName + ' ' + patientName.givenName;
    await this.page.getByRole('link', { name: 'Registration' }).click();
    await this.page.locator('a').filter({ hasText: 'Create New' }).click();
    await this.page.getByPlaceholder('First Name').fill(`${patientName.firstName}`);
    await this.page.getByPlaceholder('Last Name').fill(`${patientName.givenName}`);
    await this.page.getByLabel('Gender *').selectOption('F');
    await this.page.getByLabel('Age*').click();
    await this.page.getByLabel('Age*').fill('20');
    await this.page.getByRole('button', { name: 'Start Général visit' }).click();
    await this.page.getByRole('button', { name: 'Priority' }).click();
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async goToHomePage() {
    await this.page.goto(`${BAHMNI_URL}`);
  }

  async searchPatient(searchText: string) {
    await this.goToHomePage();
    await this.patientSearchIcon().click();
    await this.patientSearchBar().fill(searchText);
    await this.page.getByRole('link', { name: `${patientFullName}` }).first().click();
  }

  async startPatientVisit() {
    await this.searchPatient(`${patientName.firstName + ' ' + patientName.givenName}`);
    await this.page.getByRole('button', { name: 'Start a visit' }).click();
    await this.page.locator('label').filter({ hasText: 'Facility Visit' }).locator('span').first().click();
    await this.page.locator('form').getByRole('button', { name: 'Start a visit' }).click();
    await expect(this.page.getByText('Facility Visit started successfully')).toBeVisible();
    await delay(4000);
  }

  async endPatientVisit() {
    await this.searchPatient(`${patientName.firstName + ' ' + patientName.givenName}`)
    await this.page.getByRole('button', { name: 'Actions', exact: true }).click();
    await this.page.getByRole('menuitem', { name: 'End visit' }).click();
    await this.page.getByRole('button', { name: 'danger End Visit' }).click();
    await expect(this.page.getByText('Visit ended')).toBeVisible();
    await this.page.getByRole('button', { name: 'Close', exact: true }).click();
  }

  async voidPatient() {
    await this.page.goto(`${BAHMNI_URL}/openmrs/admin/patients/index.htm`);
    await this.page.getByPlaceholder(' ').fill(`${patientName.givenName}`);
    await this.page.locator('#openmrsSearchTable tbody tr.odd td:nth-child(1)').click();
    await this.page.locator('input[name="voidReason"]').fill('Void patient created by smoke test');
    await this.page.getByRole('button', { name: 'Delete Patient', exact: true }).click();
    const message = await this.page.locator('//*[@id="patientFormVoided"]').textContent();
    await expect(message?.includes('This patient has been deleted')).toBeTruthy();
  }

  async createLabOrder() {
    await this.page.goto(`${BAHMNI_URL}/bahmni/home`);
    await this.page.getByRole('link', { name: 'Clinical' }).click();
    await this.page.locator('#patientIdentifier').fill(`${patientName.givenName}`);
    await this.page.getByText(`${patientName.firstName + ' ' + patientName.givenName}`).click();
    await this.page.getByText('Consultation').nth(2).click();
    await this.page.getByText('Orders', { exact: true }).click();
    await this.page.getByText('Blood', { exact: true }).click();
    await this.page.getByText('Malaria').click();
    await this.page.getByText('Hemoglobin', { exact: true }).click();
    await this.page.getByText('Blood Sugar').click();
    await this.page.getByText('Sickling Test').click();
    await this.page.getByRole('button', { name: 'Save' }).click();
    await expect(this.page.getByText('Saved')).toBeVisible();
  }
}

import { test, expect } from '@playwright/test';
import { Odoo } from '../utils/functions/odoo';
import { Bahmni, patientName } from '../utils/functions/bahmni';

let bahmni: Bahmni;
let odoo: Odoo;

test.use({
  ignoreHTTPSErrors: true,
});

test.beforeEach(async ({ page }) => {
  bahmni = new Bahmni(page);
  odoo = new Odoo(page);

  await bahmni.login();
  await expect(page).toHaveURL(/.*dashboard/);
});

test('Ordering a lab test for a Bahmni patient creates the corresponding Odoo customer with a filled quotation.', async ({ page }) => {
  // setup
  await bahmni.createPatient();

  // replay
  await bahmni.createLabOrder();

  // verify
  await odoo.open();
  await expect(page).toHaveURL(/.*web/);
  await odoo.searchCustomer();
  const customer = await page.locator("tr.o_data_row:nth-child(1) td:nth-child(4)").textContent();
  await expect(customer?.includes(`${patientName.firstName + ' ' + patientName.givenName}`)).toBeTruthy();

  const quotation = await page.locator("tr.o_data_row:nth-child(1) td:nth-child(8) span").textContent();
  await expect(quotation?.includes("Devis")).toBeTruthy();
  await page.getByRole('cell', { name: `${patientName.firstName + ' ' + patientName.givenName}` }).click();
  const firstTest = await page.locator("tr:nth-child(1) td.o_data_cell.o_field_cell.o_list_text.o_section_and_note_text_cell.o_required_modifier");
  const secondTest = await page.locator("tr:nth-child(2) td.o_data_cell.o_field_cell.o_list_text.o_section_and_note_text_cell.o_required_modifier");
  const thirdTest = await page.locator("tr:nth-child(3) td.o_data_cell.o_field_cell.o_list_text.o_section_and_note_text_cell.o_required_modifier");
  const fourthTest = await page.locator("tr:nth-child(4) td.o_data_cell.o_field_cell.o_list_text.o_section_and_note_text_cell.o_required_modifier");

  await expect(firstTest).toContainText('Malaria');
  await expect(secondTest).toContainText('Hemoglobine');
  await expect(thirdTest).toContainText('Glycemie');
  await expect(fourthTest).toContainText('Sickling Test');
});

/*
test('Ordering a drug for a Bahmni patient creates the corresponding Odoo customer with a filled quotation.', async ({ page }) => {
  // replay
  await bahmni.goToLabOrderForm();
  await page.getByPlaceholder('Search for a drug or orderset (e.g. "Aspirin")').fill('Aspirin 325mg');
  await bahmni.fillDrugOrderForm();
  await bahmni.saveDrugOrder();

  // verify
  await odoo.open();
  await expect(page).toHaveURL(/.*web/);
  await odoo.searchCustomer();
  const customer = await page.locator("tr.o_data_row:nth-child(1) td:nth-child(4)").textContent();
  await expect(customer?.includes(`${patientName.firstName + ' ' + patientName.givenName}`)).toBeTruthy();

  const quotation = await page.locator("tr.o_data_row:nth-child(1) td:nth-child(8) span").textContent();
  await expect(quotation?.includes("Quotation")).toBeTruthy();
});
*/
test.afterEach(async ({ page }) => {
  await bahmni.voidPatient();
  await page.close();
});

import * as model from '../models/locationModel.js';
import { createMasterController } from './masterBaseController.js';
import { createMasterModel } from '../models/masterBaseModel.js';

const countryModel = createMasterModel('countries', 'CTR', ['id', 'code', 'name', 'phone_code', 'status']);
const stateModel = createMasterModel('states', 'ST', ['id', 'code', 'name', 'country_id', 'status']);
const cityModel = createMasterModel('cities', 'CTY', ['id', 'name', 'state_id', 'country_id', 'pincode', 'status']);

export const countryController = createMasterController(countryModel, 'Country', [
  { table: 'states', field: 'country_id', entityName: 'States' },
]);
export const stateController = createMasterController(stateModel, 'State', [
  { table: 'cities', field: 'state_id', entityName: 'Cities' },
]);
export const cityController = createMasterController(cityModel, 'City', []);

// Additional dropdown endpoints
export async function getCountries(_req, res, next) {
  try {
    const rows = await model.getAllCountries();
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

export async function getStatesByCountry(req, res, next) {
  try {
    const countryId = req.params.countryId;
    const rows = await model.getStatesByCountry(countryId);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

export async function getCitiesByState(req, res, next) {
  try {
    const stateId = req.params.stateId;
    const rows = await model.getCitiesByState(stateId);
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
}

export async function getPincodeByCity(req, res, next) {
  try {
    const cityId = req.params.cityId;
    const pincode = await model.getPincodeByCity(cityId);
    res.json({ data: { pincode } });
  } catch (err) {
    next(err);
  }
}

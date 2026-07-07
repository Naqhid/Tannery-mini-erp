import { Router } from 'express';
import * as ctrl from '../controllers/locationController.js';
import { validateId, validatePagination } from '../middleware/validators.js';

const router = Router();

// Countries
router.get('/countries', validatePagination, ctrl.countryController.list);
router.get('/countries/dropdown', ctrl.getCountries);
router.get('/countries/stats', ctrl.countryController.stats);
router.get('/countries/:id', validateId, ctrl.countryController.getOne);
router.post('/countries', ctrl.countryController.create);
router.put('/countries/:id', validateId, ctrl.countryController.update);
router.delete('/countries/:id', validateId, ctrl.countryController.remove);

// States
router.get('/states', validatePagination, ctrl.stateController.list);
router.get('/states/country/:countryId', ctrl.getStatesByCountry);
router.get('/states/stats', ctrl.stateController.stats);
router.get('/states/:id', validateId, ctrl.stateController.getOne);
router.post('/states', ctrl.stateController.create);
router.put('/states/:id', validateId, ctrl.stateController.update);
router.delete('/states/:id', validateId, ctrl.stateController.remove);

// Cities
router.get('/cities', validatePagination, ctrl.cityController.list);
router.get('/cities/state/:stateId', ctrl.getCitiesByState);
router.get('/cities/pincode/:cityId', ctrl.getPincodeByCity);
router.get('/cities/stats', ctrl.cityController.stats);
router.get('/cities/:id', validateId, ctrl.cityController.getOne);
router.post('/cities', ctrl.cityController.create);
router.put('/cities/:id', validateId, ctrl.cityController.update);
router.delete('/cities/:id', validateId, ctrl.cityController.remove);

export default router;

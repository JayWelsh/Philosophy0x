import { combineReducers } from 'redux';
import isConsideredMobile from './isConsideredMobile';
import ethereumAccount from './ethereumAccount';

export default combineReducers({
  isConsideredMobile,
  ethereumAccount
})
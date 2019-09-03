import { call, select, put, all, takeLatest } from 'redux-saga/effects'
import api from '../../../services/api'
import { addToCartSuccess, updateAmountSuccess, removeFromCart } from './actions'
import {formatPrice} from '../../../util/format'
import history from '../../../services/history'
import { toast }from 'react-toastify'


function* addToCart({ id }) {
  const productExist = yield select(
    state => state.cart.find(p => p.id === id)
  )

  const stock = yield call(api.get, `/stock/${id}`);

  const stockAmount = stock.data.amount;
  const currentAmount = productExist ?  productExist.amount : 0;

  const amount = currentAmount + 1;

  if(amount > stockAmount){
    toast.error('Produto fora do estoque')
    return;
  }

  if (productExist) {
    yield put(updateAmountSuccess(id, amount))
  }else{
    const response = yield call(api.get, `/products/${id}`)
    const data = {
      ...response.data,
      amount: 1,
      priceFormatterd: formatPrice(response.data.price)
    }
    yield put(addToCartSuccess(data));
    history.push('/cart')
  }

}

function* updateAmount({ id, amount }) {
  if(amount <= 0){
    yield put(removeFromCart(id));
    return
  }

  const stock = yield call(api.get, `/stock/${id}`);
  const stockAmount = stock.data.amount;

  if(amount > stockAmount){
    toast.error('Produto fora do estoque')
    return;
  }

  yield put(updateAmountSuccess(id, amount))


}

export default all([
  takeLatest('@cart/ADD_REQUEST', addToCart),
  takeLatest('@cart/UPDATE_AMOUNT_REQUEST', updateAmount),
])

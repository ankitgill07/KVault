import { RouterProvider } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { AppStateProvider } from './context/AppStateContext';
import { Provider } from 'react-redux';
import { store } from './store';
import router from './routes/routes';


function App() {
  return (
    <Provider store={store}>
      <UserProvider>
        <AppStateProvider>
          <RouterProvider router={router} />
        </AppStateProvider>
      </UserProvider>
    </Provider>
  );
}

export default App;

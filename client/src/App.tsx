import { RouterProvider } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { AppStateProvider } from './context/AppStateContext';
import { ThemeProvider } from './context/ThemeContext';
import { Provider } from 'react-redux';
import { store } from './store';
import router from './routes/routes';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <UserProvider>
          <AppStateProvider>
            <RouterProvider router={router} />
          </AppStateProvider>
        </UserProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;

import { RouterProvider } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { AppStateProvider } from './context/AppStateContext';
import router from './routes/routes';


function App() {
  return (
    <UserProvider>
      <AppStateProvider>
        <RouterProvider router={router} />
      </AppStateProvider>
    </UserProvider>
  );
}

export default App;
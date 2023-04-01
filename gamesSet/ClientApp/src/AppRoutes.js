import { Counter } from "./components/Counter";
import { Tictactoe } from "./components/Tictactoe";
import { FetchData } from "./components/FetchData";
import { Home } from "./components/Home";

const AppRoutes = [
  {
    index: true,
    element: <Home />
    },
    {
        path: '/t',
        element: <Home />
    },
  {
      path: '/Tictactoe',
      element: <Tictactoe />
  },
  {
    path: '/fetch-data',
    element: <FetchData />
  }
];

export default AppRoutes;

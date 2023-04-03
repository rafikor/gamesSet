import { Game, Tictactoe } from "./components/Tictactoe";
import { Reversi } from "./components/Reversi";
import { Home } from "./components/Home";

const AppRoutes = [
  {
    index: true,
    element: <Home />
    },
  {
      path: '/Tictactoe',
      element: <Game SpecificGame={Tictactoe} />
    },
    {
        path: '/Reversi',
        element: <Reversi />
    },
];

export default AppRoutes;

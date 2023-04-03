import { Tictactoe } from "./components/Tictactoe";
import { Game } from "./components/Game";
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
        element: <Game SpecificGame={Reversi} />
    },
];

export default AppRoutes;

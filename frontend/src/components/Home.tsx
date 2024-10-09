import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
      <Typography variant="h1">Bienvenue</Typography>
      <Link to="/game/1">Game room example</Link>
    </>
  );
};

export default Home;

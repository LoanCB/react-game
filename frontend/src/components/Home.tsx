import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <>
      <Typography variant="h1">Bienvenue</Typography>
      <Link to="/game/fa56a727-55ea-484b-af18-560c3bb5f3f7">
        Game room example
      </Link>
    </>
  );
};

export default Home;

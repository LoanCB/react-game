import { Box, Card, CircularProgress, Typography } from "@mui/material";
import { useGameStatsQuery } from "@src/store/game-api";
import { useAppSelector } from "@src/store/hooks";
import { RootState } from "@src/store/store";
import { useTranslation } from "react-i18next";

const BoxStat = ({
  statNumber,
  title,
}: {
  statNumber: number;
  title: string;
}) => (
  <Card
    sx={{
      flex: "1 1 200px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      p: 2,
    }}
  >
    <Typography fontSize={30}>{statNumber}</Typography>
    <Typography>{title}</Typography>
  </Card>
);

const Home = () => {
  const { t } = useTranslation();

  const user = useAppSelector((state: RootState) => state.user);
  const { data, isLoading } = useGameStatsQuery(user!.id, {
    skip: !user,
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (data) {
    console.log(data);
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        gap={3}
        mt={3}
      >
        <BoxStat
          statNumber={data.gamesPlayed}
          title={t("game:stats.played_games")}
        />
        <BoxStat
          statNumber={data.gamesCreated}
          title={t("game:stats.created_games")}
        />
        <BoxStat statNumber={data.gamesWon} title={t("game:stats.won_games")} />
        <BoxStat
          statNumber={data.scoreVictories}
          title={t("game:stats.score_victory")}
        />
        <BoxStat
          statNumber={data.eliminationVictories}
          title={t("game:stats.elimination_victory")}
        />
      </Box>
    );
  }
};

export default Home;

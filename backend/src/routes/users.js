import {
  getUserById,
  getUsers,
  loginUser,
  registerUser,
  verifyUser,
} from "../controllers/users.js";

export function usersRoutes(app, blacklistedTokens) {
  app
    .post("/login", async (request, reply) => {
      const user = await loginUser(request.body, app);
      if (user.error) {
        reply
          .status(user.status)
          .send({ error: user.error, errorCode: user.errorCode });
      }

      reply.status(201).send({ token: user.token, user: user.user });
    })
    .post(
      "/logout",
      { preHandler: [app.authenticate] },
      async (request, reply) => {
        const token = request.headers["authorization"].split(" ")[1]; // Récupérer le token depuis l'en-tête Authorization

        // Ajouter le token à la liste noire
        blacklistedTokens.push(token);

        reply.send({ logout: true });
      }
    );

  //inscription
  app.post("/register", async (request, reply) => {
    reply.send(await registerUser(request.body, app.bcrypt));
  });

  app.post("/verify", async (request, reply) => {
    const response = await verifyUser(request.body);
    if (response.error) {
      reply
        .status(response.status)
        .send({ error: response.error, errorCode: response.errorCode });
    }

    reply.status(201).send({ success: true });
  });

  //récupération de la liste des utilisateurs
  app.get("/users", async (request, reply) => {
    reply.send(await getUsers());
  });

  //récupération d'un utilisateur par son id
  app.get("/users/:id", async (request, reply) => {
    reply.send(await getUserById(request.params.id));
  });
}

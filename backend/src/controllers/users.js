import { createTransport } from "nodemailer";
import process from "process";
import { Op } from "sequelize";
import User from "../models/users.js";

async function generateID(id) {
  const { count } = await findAndCountAllUsersById(id);
  if (count > 0) {
    id = id.substring(0, 5);
    const { count } = await findAndCountAllUsersById(id);
    id = id + (count + 1);
  }
  return id;
}

const transporter = createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.MAIL_PORT === "465",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

export async function getUsers() {
  return await User.findAll();
}

export async function getUserById(id) {
  return await User.findByPk(id);
}

export async function findAndCountAllUsersById(id) {
  return await User.findAndCountAll({
    where: {
      id: {
        [Op.like]: `${id}%`,
      },
    },
  });
}

export async function findAndCountAllUsersByEmail(email) {
  return await User.findAndCountAll({
    where: {
      email: {
        [Op.eq]: email,
      },
    },
  });
}

export async function findAndCountAllUsersByUsername(username) {
  return await User.findAndCountAll({
    where: {
      username: {
        [Op.eq]: username,
      },
    },
  });
}

export async function registerUser(userDatas, bcrypt) {
  if (!userDatas) {
    return { error: "Aucune donnée à enregistrer" };
  }
  const { firstName, lastName, username, email, password } = userDatas;
  if (!firstName || !lastName || !username || !email || !password) {
    return { error: "Tous les champs sont obligatoires" };
  }
  //vérification que l'email n'est pas déjà utilisé
  const { count: emailCount } = await findAndCountAllUsersByEmail(email);
  if (emailCount > 0) {
    return { error: "L'adresse email est déjà utilisée." };
  }

  //vérification que le pseudo n'est pas déjà utilisé
  const { count: usernameCount } = await findAndCountAllUsersByUsername(
    username
  );
  if (usernameCount > 0) {
    return { error: "Le nom d'utilisateur est déjà utilisé." };
  }
  //création de l'identifiant
  let id = await generateID(
    (lastName.substring(0, 3) + firstName.substring(0, 3)).toUpperCase()
  );
  //hashage du mot de passe
  const hashedPassword = await bcrypt.hash(password);
  //création de l'utilisateur dans la base de données
  const user = {
    id,
    firstName,
    lastName,
    username,
    email,
    password: hashedPassword,
    verified: false,
  };

  // Send mail
  try {
    const url = `${process.env.APP_FRONT_URL}/verify?email=${email}&id=${id}`;
    const mailInfo = await transporter.sendMail({
      from: `"Skull Game" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Validation du compte Skull",
      html: `<a href="${url}" target="_blank">Activer mon compte</a>`,
    });

    console.log(`Email sent : ${mailInfo.messageId}`);

    return await User.create(user);
  } catch (error) {
    console.log(error);
    return {
      error: "Échec de la création du compte : impossible d'envoyer un mail",
      errorCode: "CANNOT_SEND_MAIL",
      status: 500,
    };
  }
}

export async function verifyUser(userDatas) {
  if (!userDatas) {
    return {
      error: "Aucune donnée n'a été envoyée",
      errorCode: "INVALID_REQUEST",
      status: 400,
    };
  }

  const { email, id } = userDatas;
  if (!email || !id) {
    return {
      error: "Tous les champs sont obligatoires",
      errorCode: "INVALID_REQUEST",
      status: 400,
    };
  }

  const user = await User.findOne({
    where: {
      email: {
        [Op.eq]: email,
      },
      id: {
        [Op.eq]: id,
      },
    },
  });

  if (!user) {
    return {
      error: "Utilisateur non trouvé",
      errorCode: "USER_NOT_FOUND",
      status: 404,
    };
  }

  user.verified = true;
  user.save();

  return {};
}

export async function loginUser(userDatas, app) {
  if (!userDatas) {
    return {
      error: "Aucune donnée n'a été envoyée",
      errorCode: "INVALID_REQUEST",
      status: 400,
    };
  }
  const { email, password } = userDatas;
  if (!email || !password) {
    return {
      error: "Tous les champs sont obligatoires",
      errorCode: "INVALID_REQUEST",
      status: 400,
    };
  }
  //vérification que l'email est utilisé
  const { count, rows } = await findAndCountAllUsersByEmail(email);
  if (count === 0) {
    return {
      error: "Il n'y a pas d'utilisateur associé à cette adresse email.",
      errorCode: "USER_NOT_FOUND",
      status: 404,
    };
  } else if (rows[0].verified === false) {
    return {
      error:
        "Votre compte n'est pas encore vérifié. Veuillez vérifier votre boîte mail.",
      errorCode: "USER_NOT_VERIFIED",
      status: 401,
    };
  }

  //récupération de l'utilisateur
  const user = rows[0];

  //comparaison des mots de passe
  const match = await app.bcrypt.compare(password, user.password);
  if (!match) {
    return {
      error: "Mot de passe incorrect",
      errorCode: "INVALID_PASSWORD",
      status: 400,
    };
  }

  // Générer le JWT après une authentification réussie
  const token = app.jwt.sign(
    { id: user.id, username: user.username },
    { expiresIn: "3h" }
  );
  return { token, user };
}

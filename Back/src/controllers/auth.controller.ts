import bcrypt from "bcrypt";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client.js";

type AuthUsuario = {
  id: number;
  email: string;
  nome: string;
  tipo: string;
};

type AuthOficina = {
  id: number;
  nome?: string | null;
};

function signFinalToken(usuario: AuthUsuario, oficina: AuthOficina, perfil: string) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET nao configurado.");
  }

  const usuarioPayload = {
    id: usuario.id,
    email: usuario.email,
    nome: usuario.nome,
    tipo: perfil,
    oficinaId: oficina.id,
    oficina_id: oficina.id,
  };

  const token = jwt.sign(usuarioPayload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  return { token, usuario: usuarioPayload };
}

export async function login(req: Request, res: Response) {
  try {
    const email = String(req.body?.email ?? "").trim().toLowerCase();
    const senha = String(req.body?.senha ?? "");

    if (!email || !senha) {
      return res.status(400).json({ message: "E-mail e senha sao obrigatorios." });
    }

    if (!process.env.JWT_SECRET) {
      console.error("ERRO FATAL: JWT_SECRET nao configurado no ambiente.");
      return res.status(500).json({
        message: "Erro interno de configuracao. Contate o administrador.",
      });
    }

    const usuarios = await prisma.usuario.findMany({
      where: { email, deleted_at: null, status: "ativo" },
      include: {
        acessos: {
          where: { deleted_at: null, status: "ativo" },
          include: { oficina: true },
        },
      },
    });

    const matchedUsuarios: typeof usuarios = [];
    for (const candidate of usuarios) {
      if (await bcrypt.compare(senha, candidate.senha)) {
        matchedUsuarios.push(candidate);
      }
    }

    if (!matchedUsuarios.length) {
      await bcrypt.compare(senha, "$2b$10$invalidsaltsimulatingcomparexxxxxxx");
      return res.status(401).json({
        message: "E-mail ou senha invalidos.",
      });
    }

    const officeOptions = matchedUsuarios.flatMap((usuario) => {
      return usuario.acessos.map((acesso) => ({
        usuario,
        userId: usuario.id,
        id: acesso.oficina_id,
        nome: acesso.oficina?.nome ?? `Oficina ${acesso.oficina_id}`,
        perfil: acesso.perfil,
      }));
    });

    const officesById = new Map<number, (typeof officeOptions)[number]>();
    for (const office of officeOptions) {
      if (!officesById.has(office.id)) officesById.set(office.id, office);
    }

    const offices = Array.from(officesById.values());
    const oficinas = offices.map(({ id, nome, perfil }) => ({ id, nome, perfil }));

    if (!oficinas.length) {
      return res.status(403).json({ message: "Usuario sem acesso a nenhuma oficina." });
    }

    if (oficinas.length > 1) {
      const selectionToken = jwt.sign(
        {
          purpose: "office-selection",
          allowed: offices.map((office) => ({
            userId: office.userId,
            oficinaId: office.id,
          })),
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      return res.json({
        requiresOfficeSelection: true,
        selectionToken,
        usuario: {
          id: matchedUsuarios[0].id,
          email: matchedUsuarios[0].email,
          nome: matchedUsuarios[0].nome,
          tipo: matchedUsuarios[0].tipo,
        },
        oficinas,
      });
    }

    const selected = offices[0];
    const oficina = oficinas[0];
    return res.json({
      ...signFinalToken(selected.usuario, oficina, oficina.perfil),
      oficinas,
    });
  } catch (err) {
    console.error("Erro no login:", err);
    return res.status(500).json({ message: "Erro interno ao autenticar." });
  }
}

export async function selectOficina(req: Request, res: Response) {
  try {
    const selectionToken = String(req.body?.selectionToken ?? "");
    const oficinaId = Number(req.body?.oficina_id ?? req.body?.oficinaId);

    if (!selectionToken || !oficinaId) {
      return res.status(400).json({ message: "Token de selecao e oficina_id sao obrigatorios." });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET nao configurado." });
    }

    const decoded = jwt.verify(selectionToken, process.env.JWT_SECRET) as {
      userId?: number;
      purpose: string;
      allowed?: { userId: number; oficinaId: number }[];
    };

    if (decoded.purpose !== "office-selection") {
      return res.status(401).json({ message: "Token invalido." });
    }

    const allowed = decoded.allowed?.find((item) => item.oficinaId === oficinaId);
    const userId = allowed?.userId ?? decoded.userId;
    if (!userId) {
      return res.status(403).json({ message: "Usuario sem acesso a esta oficina." });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        acessos: {
          where: { oficina_id: oficinaId, deleted_at: null, status: "ativo" },
          include: { oficina: true },
        },
      },
    });

    if (!usuario || usuario.deleted_at || usuario.status !== "ativo") {
      return res.status(401).json({ message: "Usuario invalido." });
    }

    const acesso = usuario.acessos[0];

    if (!acesso) {
      return res.status(403).json({ message: "Usuario sem acesso a esta oficina." });
    }

    return res.json(signFinalToken(usuario, acesso.oficina, acesso.perfil));
  } catch (err) {
    console.error("Erro ao selecionar oficina:", err);
    return res.status(401).json({ message: "Nao foi possivel selecionar a oficina." });
  }
}

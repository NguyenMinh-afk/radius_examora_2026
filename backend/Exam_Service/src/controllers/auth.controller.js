import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
	try {
		const { email, password, full_name } = req.body;
		const existingUser = await User.findOne({ where: { email } });
		if (existingUser) return res.status(400).json({ message: "Email already exists" });

		const password_hash = await bcrypt.hash(password, 10);
		const user = await User.create({ email, password_hash, full_name });

		res.status(201).json({ message: "User registered successfully", user: { id: user.id, email: user.email, full_name: user.full_name } });
	} catch (err) {
		res.status(500).json({ message: "Registration failed", error: err.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ where: { email } });
		if (!user) return res.status(400).json({ message: "Invalid email or password" });

		const valid = await bcrypt.compare(password, user.password_hash);
		if (!valid) return res.status(400).json({ message: "Invalid email or password" });

		const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "7d" });
		res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name } });
	} catch (err) {
		res.status(500).json({ message: "Login failed", error: err.message });
	}
};

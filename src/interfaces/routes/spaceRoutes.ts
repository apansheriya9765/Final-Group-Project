import { Router } from "express";
import { SpaceController } from "../controllers/SpaceController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.get("/", SpaceController.getAll);
router.post("/", authenticate, authorize("ADMIN"), SpaceController.create);

export default router;

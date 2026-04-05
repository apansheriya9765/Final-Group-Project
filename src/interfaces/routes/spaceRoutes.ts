import { Router } from "express";
import { SpaceController } from "../controllers/SpaceController";
import { authenticate, authorize } from "../middleware/authMiddleware";

const router = Router();

router.get("/", SpaceController.getAll);
router.post("/", authenticate, authorize("ADMIN"), SpaceController.create);
router.put("/:id", authenticate, authorize("ADMIN"), SpaceController.update);
router.delete("/:id", authenticate, authorize("ADMIN"), SpaceController.remove);

export default router;

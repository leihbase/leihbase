import { expect, test } from "@playwright/test";
import { ClientResponseError } from "pocketbase";
import { createUser, DEFAULT_PASSWORD } from "../lib/user";
import { pocketbase } from "../services/pocketbase";

test.describe("user", () => {
  test.describe("role management", () => {
    test("regular user cannot update own role to admin", async () => {
      const pb = await pocketbase();
      const user = await createUser();
      const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);

      // User can call update with role field, but role change is ignored
      const updatedUser = await userPb.collection("users").update(user.id, {
        role: "admin",
        name: "Updated Name",
      });

      // Name should be updated
      expect(updatedUser.name).toBe("Updated Name");
      // Role should still be "user" (not changed)
      expect(updatedUser.role).toBe("user");

      // Verify via superuser
      const verifiedUser = await pb.collection("users").getOne(user.id);
      expect(verifiedUser.role).toBe("user");
    });

    test("regular user cannot update own role to manager", async () => {
      const pb = await pocketbase();
      const user = await createUser();
      const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);

      const updatedUser = await userPb.collection("users").update(user.id, {
        role: "manager",
      });

      expect(updatedUser.role).toBe("user");

      // Verify via superuser
      const verifiedUser = await pb.collection("users").getOne(user.id);
      expect(verifiedUser.role).toBe("user");
    });

    test("regular user cannot update another user's role", async () => {
      const user1 = await createUser();
      const userPb1 = await pocketbase(user1.email, DEFAULT_PASSWORD, false);
      const user2 = await createUser();

      // User1 tries to update user2's role - should throw because regular users
      // cannot access other users' records
      await expect(
        userPb1.collection("users").update(user2.id, { role: "admin" })
      ).rejects.toThrow(ClientResponseError);
    });
  });

  test.describe("authentication", () => {
    test("user with admin role can authenticate", async () => {
      const pb = await pocketbase();
      const adminUser = await createUser(undefined, undefined, "admin");
      const adminPb = await pocketbase(adminUser.email, DEFAULT_PASSWORD, false);

      expect(adminPb.authStore.isValid).toBe(true);
      expect(adminPb.authStore.model?.role).toBe("admin");
    });

    test("user with manager role can authenticate", async () => {
      const pb = await pocketbase();
      const managerUser = await createUser(undefined, undefined, "manager");
      const managerPb = await pocketbase(managerUser.email, DEFAULT_PASSWORD, false);

      expect(managerPb.authStore.isValid).toBe(true);
      expect(managerPb.authStore.model?.role).toBe("manager");
    });

    test("regular user can authenticate", async () => {
      const user = await createUser();
      const userPb = await pocketbase(user.email, DEFAULT_PASSWORD, false);

      expect(userPb.authStore.isValid).toBe(true);
      expect(userPb.authStore.model?.role).toBe("user");
    });
  });
});

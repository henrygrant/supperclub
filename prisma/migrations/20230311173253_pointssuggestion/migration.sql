/*
  Warnings:

  - Added the required column `points` to the `UserInGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `suggestion` to the `UserInGroup` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserInGroup" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "suggestion" TEXT NOT NULL,

    PRIMARY KEY ("userId", "groupId"),
    CONSTRAINT "UserInGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserInGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserInGroup" ("groupId", "userId") SELECT "groupId", "userId" FROM "UserInGroup";
DROP TABLE "UserInGroup";
ALTER TABLE "new_UserInGroup" RENAME TO "UserInGroup";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

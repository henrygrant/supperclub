-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserInGroup" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "suggestion" TEXT,

    PRIMARY KEY ("userId", "groupId"),
    CONSTRAINT "UserInGroup_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserInGroup_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserInGroup" ("groupId", "points", "suggestion", "userId") SELECT "groupId", "points", "suggestion", "userId" FROM "UserInGroup";
DROP TABLE "UserInGroup";
ALTER TABLE "new_UserInGroup" RENAME TO "UserInGroup";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

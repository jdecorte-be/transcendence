-- CreateIndex
CREATE INDEX "blocked_friends_dmRoomId_idx" ON "blocked_friends"("dmRoomId");

-- CreateIndex
CREATE INDEX "blocked_friends_blocked_id_idx" ON "blocked_friends"("blocked_id");

-- CreateIndex
CREATE INDEX "friends_toId_idx" ON "friends"("toId");

-- CreateIndex
CREATE INDEX "matches_winner_id_idx" ON "matches"("winner_id");

-- CreateIndex
CREATE INDEX "matches_participant1Id_idx" ON "matches"("participant1Id");

-- CreateIndex
CREATE INDEX "matches_participant2Id_idx" ON "matches"("participant2Id");

-- CreateIndex
CREATE INDEX "messages_roomId_idx" ON "messages"("roomId");

-- CreateIndex
CREATE INDEX "notifications_receiverId_idx" ON "notifications"("receiverId");

-- CreateIndex
CREATE INDEX "room_members_roomId_idx" ON "room_members"("roomId");

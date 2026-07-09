export function joinUserRoom(socket) {
  const userId = socket.data.user.id;

  if (!userId) {
    throw new Error("User ID not found");
  }

  const room = `user:${userId}`;

  socket.join(room);

  console.log(`📥 Joined Room: ${room}`);
}

export function leaveUserRoom(socket) {
  const userId = socket.data.user?.id;

  if (!userId) return;

  const room = `user:${userId}`;

  socket.leave(room);

  console.log(`📤 Left Room: ${room}`);
}
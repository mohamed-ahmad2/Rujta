import * as signalR from "@microsoft/signalr";

let connection = null;

export const startNotificationConnection = async (userId) => {
  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_URL}/notifications`, {
      accessTokenFactory: () => localStorage.getItem("token"), // JWT token
    })
    .withAutomaticReconnect()
    .build();

  connection.onclose(() => console.log("SignalR Disconnected"));

  try {
    await connection.start();
    console.log("SignalR Connected");

    // join group by userId
    if (userId) {
      await connection.invoke("AddToGroup", userId).catch(() => {});
    }
  } catch (err) {
    console.error("SignalR Connection Error:", err);
  }

  return connection;
};

export const getNotificationConnection = () => connection;
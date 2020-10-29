import React, { useState, useEffect } from "react";
import { Container, Table, Alert } from "react-bootstrap";
import { ipcRenderer } from "electron";
import LogItem from "./LogItem";
import AddLogItem from "./AddLogItem";

const App = () => {
    const [alert, setAlert] = useState({ show: false, message: "", variant: "success" });
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        ipcRenderer.send("logs:load");

        ipcRenderer.on("logs:get", (e, logs) => setLogs(JSON.parse(logs)));

        ipcRenderer.on("logs:clear", () => {
            setLogs([]);
            showAlert("Logs cleared");
        });
    }, []);

    const addItem = (item) => {
        if (item.text === "" || item.user === "" || item.priority === "") {
            showAlert("Please enter all fields", "danger");
            return;
        } 

        ipcRenderer.send("logs:add", item);
        showAlert("Log added");
    };

    const deleteItem = (id) => {
        ipcRenderer.send("logs:delete", id);
        showAlert("Logs deleted", "danger");
    };

    const showAlert = (message, variant = "success", seconds = 3000) => {
        setAlert({ message, variant, show: true });
        setTimeout(() => setAlert({ message: "", show: false }), seconds);
    };

    return (
        <Container>
            <AddLogItem addItem={addItem} />
            <Alert show={alert.show} variant={alert.variant}>
                {alert.message}
            </Alert>
            <Table>
                <thead>
                    <tr>
                        <th>Priority</th>
                        <th>Log text</th>
                        <th>User</th>
                        <th>Created at</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log) => (
                        <LogItem key={log._id} log={log} deleteItem={deleteItem} />
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default App;

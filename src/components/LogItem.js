import React from "react";
import { Button, Badge } from "react-bootstrap";
import Moment from "react-moment";

const LogItem = (props) => {
    const { log, deleteItem } = props;

    const setVariant = () => {
        if (log.priority === "high") {
            return "danger";
        } else if (log.priority === "moderate") {
            return "warning";
        } else {
            return "success";
        }
    };

    return (
        <tr>
            <td>
                <Badge variant={setVariant()} className="p-2">
                    {log.priority.charAt(0).toUpperCase() + log.priority.slice(1)}
                </Badge>
            </td>
            <td>{log.text}</td>
            <td>{log.user}</td>
            <td>
                <Moment format="MMMM Do YYYY, hh:mm:ss">{new Date(log.created)}</Moment>
            </td>
            <td>
                <Button variant="danger" size="sm" onClick={() => deleteItem(log._id)}>
                    X
                </Button>
            </td>
        </tr>
    );
};

export default LogItem;

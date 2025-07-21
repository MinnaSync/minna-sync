import { memo, useRef } from "react";
import { useParams } from "react-router";
import styles from './BottomArea.module.scss'

import { useWebsocket } from "#/providers/WebsocketProvider";
import { ModalType, useModal } from "#/providers/ModalProvider";

import { CommandType } from "#/util/ws/types";
import Button from "#/components/Button/Button";
import { Input } from "#/components/Input/Input";
import { PurgeMessagesIcon, SendMessageIcon, TakeRemoteIcon, ViewQueueIcon } from "#/components/Icons/Icons";

export const BottomArea = memo(() => {
    const modal = useModal();

    const inputRef = useRef<HTMLInputElement>(null);
    const channelId = useParams().channelId;
    const websocket = useWebsocket();

    const runCommand = (command: CommandType) => {
        websocket.emit("run_command", { type: command });
    }

    const sendMessage = (message: string) => {
        websocket.emit("send_message", {
            message: message
        });
    }

    const messageSubmit = () => {
        if (!inputRef.current) return;
        const message = inputRef.current.value;

        if (message) {
            sendMessage(message);
            inputRef.current.value = "";
        }
    }

    return (<>
        <div className={styles.chat_bottom_area}>
            <div className={styles.message_input}>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    messageSubmit();
                }}>
                    <Input
                        ref={inputRef}
                        placeholder={`Message #${channelId}`}
                    />
                </form>
            </div>
            <div className={styles.quick_actions}>
                <div className={styles.quick_actions_group}>
                    <Button
                        type="submit"
                        display="Ghost"
                        color="White"
                        textInverted
                        icon={{
                            position: 'left',
                            element: <ViewQueueIcon
                                width="24px"
                                height="24px"
                            />
                        }}
                        onClick={() => {
                            if (modal.modal !== null) return;
                            modal.setModal(ModalType.ManageQueue);
                        }}
                    >
                    </Button>
                    <Button
                        type="submit"
                        display="Ghost"
                        color="White"
                        textInverted
                        icon={{
                            position: 'left',
                            element: <TakeRemoteIcon
                                width="24px"
                                height="24px"
                            />
                        }}
                        onClick={() => runCommand(CommandType.TakeRemote)}
                    ></Button>
                    <Button
                        type="submit"
                        display="Ghost"
                        color="Danger"
                        textInverted
                        icon={{
                            position: 'left',
                            element: <PurgeMessagesIcon
                                width="24px"
                                height="24px"
                            />
                        }}
                        onClick={() => runCommand(CommandType.PurgeMessages)}
                    ></Button>
                </div>
                <div className={styles.quick_actions_group}>
                    <Button
                        type="submit"
                        display="Ghost"
                        color="Primary"
                        textInverted
                        icon={{
                            position: 'left',
                            element: <SendMessageIcon
                                width="24px"
                                height="24px"
                            />
                        }}
                        onClick={messageSubmit}
                    ></Button>
                </div>
            </div>
        </div>
    </>);
});
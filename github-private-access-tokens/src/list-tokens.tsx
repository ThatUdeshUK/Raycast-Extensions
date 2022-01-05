import { ActionPanel, AlertActionStyle, AlertOptions, allLocalStorageItems, confirmAlert, CopyToClipboardAction, Form, Icon, List, PushAction, removeLocalStorageItem, setLocalStorageItem, showToast, SubmitFormAction, ToastStyle, useNavigation } from "@raycast/api";
import { useEffect, useState } from "react";

interface Token {
    key: string;
    value: string;
}

function CreateTokenForm(props: { onCreate: (token: Token) => void }) {
    const { pop } = useNavigation();

    function handleSubmit(values: { key: string, value: string }) {
        props.onCreate({ key: values.key, value: values.value });
        pop();
    }

    return (
        <Form
            actions={
                <ActionPanel>
                    <SubmitFormAction title="Create Token" onSubmit={handleSubmit} />
                </ActionPanel>
            }
        >
            <Form.TextField id="key" title="Name of the Token" />
            <Form.TextField id="value" title="Access Token" />
        </Form>
    );
}

function CopyTokenAction(props: { token: string }) {
    return (
        <CopyToClipboardAction content={props.token} />
    );
}

function CreateTokenAction(props: { onCreate: (token: Token) => void }) {
    return (
        <PushAction
            icon={Icon.Pencil}
            title="Create Token"
            shortcut={{ modifiers: ["cmd"], key: "n" }}
            target={<CreateTokenForm onCreate={props.onCreate} />}
        />
    );
}

function DeleteTokenAction(props: { onDelete: () => void }) {
    return (
        <ActionPanel.Item
            icon={Icon.Trash}
            title="Delete Token"
            shortcut={{ modifiers: ["ctrl"], key: "x" }}
            onAction={props.onDelete}
        />
    );
}

export default function Command() {
    const [tokens, setTokens] = useState<Token[]>([]);

    useEffect(() => {
        async function fetchTokens() {
            const items = await allLocalStorageItems();
            const tokens = Object.entries(items).map((element) => {
                return {key: element[0], value: element[1]}
            });
            setTokens(tokens);
        }
    
        fetchTokens();
      }, []);

    async function handleCreate(token: Token) {
        await setLocalStorageItem(token.key, token.value);

        const newTokens = [...tokens, token];
        setTokens(newTokens);
    }

    async function handleDelete(index: number) {
        const options: AlertOptions = {
            title: `Delete ${tokens[index].key}`,
            message: "Are you sure?",
            primaryAction: {
                title: 'Delete',
                style: AlertActionStyle.Destructive,
                onAction: async () => {
                    await showToast(ToastStyle.Success, "Token Deleted", tokens[index].key);
                }
            }
        };

        if (await confirmAlert(options)) {
            await removeLocalStorageItem(tokens[index].key);

            const newTokens = [...tokens];
            newTokens.splice(index, 1);
            setTokens(newTokens);
        }
    }

    return (
        <List
            actions={
                <ActionPanel>
                    <CreateTokenAction onCreate={handleCreate} />
                </ActionPanel>
            }
        >
            {tokens.map((token, index) => (
                <List.Item
                    key={index}
                    title={token.key}
                    subtitle={token.value}
                    actions={
                        <ActionPanel>
                            <ActionPanel.Section>
                                <CopyTokenAction token={token.value} />
                                <CreateTokenAction onCreate={handleCreate} />
                            </ActionPanel.Section>
                            <ActionPanel.Section>
                                <DeleteTokenAction onDelete={() => handleDelete(index)} />
                            </ActionPanel.Section>
                        </ActionPanel>
                    }
                />
            ))}
        </List>
    );
}
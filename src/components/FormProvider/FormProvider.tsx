import { FormEvent, Fragment, useState } from "react";
import styles from "./FormProvider.module.scss";

import { Input } from "#/components/Input/Input";
import { Typography } from "../Typography/Typography";

export enum FormFieldType {
    ShortText,
}

type FormProviderField = {
    type: FormFieldType;

    label: string;
    placeholder?: string;

    minLength?: number;
    maxLength?: number;
    required?: boolean;
};

type FormProviderProps = {
    id: string;
    fields: { [id: string]: FormProviderField };

    onSubmitFail: () => void;
    onSubmit: (data: Record<string, string>) => void;
};

export function FormProvider({ id, fields, onSubmitFail, onSubmit }: FormProviderProps) {
    const [ fieldErrors, setFieldErrors ] = useState<Record<string, string>>({});
    
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const results: Record<string, string> = {};
        const errors: Record<string, string> = {};

        const data = new FormData(e.target as HTMLFormElement);
        for (const [key] of data.entries()) {
            const field = fields[key];

            const value = data.get(key)!;
            const valueStr = value.toString();

            if (field.required && (!value || valueStr.length === 0)) {
                errors[key] = "This field is required.";
                continue;
            }

            if (field.minLength && valueStr.length < field.minLength) {
                errors[key] = `Can't be less than ${field.minLength} characters.`;
                continue;
            }

            if (field.maxLength && valueStr.length > field.maxLength) {
                errors[key] = `Can't be more than ${field.maxLength} characters.`;
                continue;
            }

            results[key] = valueStr;
        }

        if (Object.keys(errors).length > 0) {
            onSubmitFail();
            setFieldErrors(errors);

            return;
        }

        onSubmit(results);
        setFieldErrors({});
    }

    return (<form id={id} className={styles.form} onSubmit={handleSubmit}>
        {Object.entries(fields).map(([k, field]) => (<Fragment key={k}>
            <div className={styles.field}>
               <div className={styles.heading}>
                    <div className={styles.label}>
                        <Typography variant="heading" size="sm" weight="semi_bold">
                            {field.label}
                        </Typography>
                        {field.required &&
                            <Typography className={styles.is_required} variant="heading" size="sm" weight="semi_bold">
                                *
                            </Typography>
                        }
                    </div>
                    {fieldErrors[k] &&
                        <div className={styles.error}>
                            <Typography variant="body" size="xs" weight="semi_bold">
                                {fieldErrors[k]}
                            </Typography>
                        </div>
                    }
               </div>

                {field.type === FormFieldType.ShortText &&
                    <Input
                        name={k}
                        placeholder={field.placeholder}
                    />
                }
            </div>
        </Fragment>))}
    </form>);
}
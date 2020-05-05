import React from 'react';
import { Checkbox, Textarea } from 'nav-frontend-skjema';
import { Element } from 'nav-frontend-typografi';

import DatePicker from '../formComponents/DatePicker';
import SectionContainer from '../SectionContainer';
import Subsection from '../formComponents/Subsection';
import { ErrorSchemaType, SchemaType } from '../../Form';
import { Section } from '../../../../types/Section';
import { Validate } from '../../validation';

export type Tilbakedatering = {
    erTilbakedatert: boolean;
    kontaktDato?: Date;
    kunneIkkeIvaretaEgneInteresser: boolean;
    begrunnelseIkkeKontakt?: string;
};

type TilbakedateringSectionProps = {
    section: Section;
    setSchema: (value: React.SetStateAction<SchemaType>) => void;
    schema: SchemaType;
    errors: ErrorSchemaType;
    validate: Validate;
};

const TilbakedateringSection = ({ section, setSchema, schema, errors, validate }: TilbakedateringSectionProps) => {
    return (
        <SectionContainer section={section}>
            <Subsection sectionIdentifier="11.1" underline={false}>
                <Checkbox
                    disabled
                    checked={schema.erTilbakedatert}
                    label="Er sykmelding tilbakedatert?"
                    onChange={() =>
                        setSchema(state => ({
                            ...state,
                            erTilbakedatert: !state.erTilbakedatert,
                        }))
                    }
                    feil={errors.erTilbakedatert}
                />
                <br />
                {schema.erTilbakedatert && (
                    <DatePicker
                        label="Oppgi dato for dokumenterbar kontakt med pasienten"
                        value={schema.kontaktDato}
                        onChange={newDate =>
                            setSchema(state => ({
                                ...state,
                                kontaktDato: newDate,
                            }))
                        }
                    />
                )}
            </Subsection>

            <Subsection sectionIdentifier="11.2" underline={false}>
                <Checkbox
                    disabled
                    checked={schema.kunneIkkeIvaretaEgneInteresser}
                    label="Pasienten har ikke kunnet ivareta egne interesser"
                    onChange={() => {
                        setSchema(state => ({
                            ...state,
                            kunneIkkeIvaretaEgneInteresser: !state.kunneIkkeIvaretaEgneInteresser,
                        }));
                        validate('kunneIkkeIvaretaEgneInteresser', schema.kunneIkkeIvaretaEgneInteresser);
                    }}
                    feil={errors.kunneIkkeIvaretaEgneInteresser}
                />
                <br />
                {schema.kunneIkkeIvaretaEgneInteresser && (
                    <Textarea
                        disabled
                        maxLength={0}
                        value={schema.begrunnelseIkkeKontakt || ''}
                        onChange={({ target: { value } }) => {
                            setSchema(state => ({
                                ...state,
                                begrunnelseIkkeKontakt: value,
                            }));
                            validate('begrunnelseIkkeKontakt', value);
                        }}
                        feil={errors.begrunnelseIkkeKontakt}
                        label={<Element>Begrunn</Element>}
                    />
                )}
            </Subsection>
        </SectionContainer>
    );
};

export default TilbakedateringSection;

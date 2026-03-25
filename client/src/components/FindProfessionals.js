import React, { useState } from 'react';
import styled from 'styled-components';
import UploadableImage from './UploadableImage';
import usePersistedImage from '../hooks/usePersistedImage';

const Section = styled.section`
  display: flex;
  flex-direction: row;
  background: #fff;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ImageWrap = styled.div`
  width: 42.65%;
  flex-shrink: 0;
  height: 627px;

  @media (max-width: 768px) {
    width: 100%;
    height: 400px;
  }

  @media (max-width: 480px) {
    height: 300px;
  }
`;

const SideImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Content = styled.div`
  padding-left: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;

  @media (max-width: 1279px) {
    padding-left: 70px;
  }
  @media (max-width: 959px) {
    padding-left: 8.75%;
  }
  @media (max-width: 768px) {
    padding: 30px 24px 40px;
  }
`;

const Title = styled.h2`
  font-family: 'Bernaillo', 'Dancing Script', cursive;
  font-size: 49px;
  line-height: 63px;
  color: #003863;
  font-weight: 400;
  margin-bottom: 14px;
  margin-top: 80px;

  @media (max-width: 959px) {
    margin-top: 33px;
  }
  @media (max-width: 639px) {
    margin-top: 25px;
  }
`;

const Form = styled.form`
  max-width: 600px;
`;

const FormRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
`;

const Label = styled.label`
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 20px;
  line-height: 27px;
  color: #003863;
  padding-bottom: 10px;
`;

const Input = styled.input`
  border: 1px solid ${({ $invalid }) => ($invalid ? 'red' : '#d6d6d6')};
  border-radius: 2px;
  height: 38px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 27px;
  color: #003863;
  padding: 6px 10px;
  width: ${({ $width }) => $width || '140px'};
  outline: none;
  &:focus {
    border-color: #003863;
  }

  @media (max-width: 768px) {
    width: 100% !important;
  }
`;

const SubmitArea = styled.div`
  margin-top: 20px;
`;

const SubmitBtn = styled.button`
  display: block;
  width: 316px;
  height: 44px;
  line-height: 41px;
  background: #003863;
  color: #fff;
  border: none;
  border-radius: 26px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
  text-align: center;
  &:hover {
    background: #003156;
  }

  @media (max-width: 768px) {
    width: 100%;
    max-width: 316px;
    height: 38px;
    font-size: 15px;
    line-height: normal;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: #003863;
  cursor: pointer;
  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    accent-color: #003863;
  }
`;

const SmallNote = styled.p`
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  line-height: 16px;
  color: #666;
  margin-top: 8px;
  max-width: 450px;
  a {
    color: #003863;
    text-decoration: underline;
  }
`;

const ErrorText = styled.p`
  color: red;
  font-size: 13px;
  margin-top: 10px;
`;

const SuccessMessage = styled.div`
  font-family: 'Inter', sans-serif;
  font-size: 20px;
  color: #003863;
  padding: 40px 0;
`;

function FindProfessionals() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', eventDate: '', eventLocation: '', okToText: true
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMsg] = useState('');
  const defaultSide = `${process.env.PUBLIC_URL}/images/form-main.jpg`;
  const [sideImage, setSideImage, , resetSide] = usePersistedImage('findpros-side', defaultSide);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = true;
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = true;
    if (!formData.phone.trim()) errs.phone = true;
    if (!formData.eventLocation.trim()) errs.eventLocation = true;
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) { setSubmitted(true); setSuccessMsg(data.message); }
      else setErrors({ form: data.errors?.join(', ') || 'Something went wrong.' });
    } catch {
      setErrors({ form: 'Network error. Please try again.' });
    }
  };

  return (
    <Section id="FindLocalPros">
      <ImageWrap>
        <UploadableImage
          display="block"
          width="100%"
          height="100%"
          shrink="0"
          storageKey="findpros-side"
          onReplace={(url) => setSideImage(url)}
          onDelete={resetSide}
        >
          <SideImg src={sideImage || defaultSide} alt="Local Wedding Photography" />
        </UploadableImage>
      </ImageWrap>
      <Content>
        <Title>Get a Quote</Title>
        {submitted ? (
          <SuccessMessage><p>{successMessage}</p></SuccessMessage>
        ) : (
          <Form onSubmit={handleSubmit} noValidate>
            <FormRow>
              <Field>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="First Last" value={formData.name} onChange={handleChange} $invalid={errors.name} />
              </Field>
              <Field>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} $invalid={errors.email} $width="220px" />
              </Field>
            </FormRow>
            <FormRow>
              <Field>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" placeholder="999-999-9999" value={formData.phone} onChange={handleChange} $invalid={errors.phone} />
              </Field>
              <Field>
                <Label htmlFor="eventDate">Event Date</Label>
                <Input id="eventDate" name="eventDate" placeholder="MM/DD/YYYY" value={formData.eventDate} onChange={handleChange} />
              </Field>
              <Field>
                <Label htmlFor="eventLocation">Event Location</Label>
                <Input id="eventLocation" name="eventLocation" placeholder="City, State Zip" value={formData.eventLocation} onChange={handleChange} $invalid={errors.eventLocation} $width="180px" />
              </Field>
            </FormRow>
            <SubmitArea>
              <SubmitBtn type="submit">Send Me A Quote</SubmitBtn>
              <CheckboxLabel>
                <input type="checkbox" name="okToText" checked={formData.okToText} onChange={handleChange} />
                <span>OK to Text?</span>
              </CheckboxLabel>
              <SmallNote>
                Opt-in to receive text messages about services and offers for your event.
                Text and data rates may apply. Reply STOP at anytime to opt-out.
              </SmallNote>
              <SmallNote>
                By signing up, I expressly agree to Aaron It Out Photography's Privacy Policy. View our complete{' '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">privacy policy</a>.
              </SmallNote>
              {errors.form && <ErrorText>{errors.form}</ErrorText>}
            </SubmitArea>
          </Form>
        )}
      </Content>
    </Section>
  );
}

export default FindProfessionals;

import React, {useEffect, useRef, useState} from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from "axios";
import styles from './formPage.module.css'

const initialValues = {
    name: '',
    date: '',
    gender: '',
    city: '',
    specialty: '',
    doctor: '',
    email: '',
    phone: '',
};

const validationSchema = Yup.object().shape({
    name: Yup.string().matches(/^[a-zA-Zа-яА-Я\s]+$/, 'Ім\'я не повинно містити числа').required('Обов\'язкове поле'),
    date: Yup.date().required('Обов\'язкове поле'),
    gender: Yup.string().required('Обов\'язкове поле'),
    city: Yup.string().required('Обов\'язкове поле'),
    specialty: Yup.string(),
    doctor: Yup.string().required('Обов\'язкове поле'),
    email: Yup.string().email('Некоректна адреса електронної пошти'),
    phone: Yup.string().when("email", {
        is: (email) => !email,
        then: () => Yup.string().matches(/^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]*$/g, 'Телефон повинен містити лише числа').min(10, 'Телефон повинен містити не менше 10 символів').required("Імейл або телефон обовʼязкові"),
    }),
})

const getAPIRequest = (api, setResponse, setResponseFiltered=null) => {
    axios.get(api)
        .then(response => {
            setResponse(response.data);
            if(typeof setResponseFiltered=='function')
                setResponseFiltered(response.data)
        })
        .catch(error => {
            console.error(error);
        });
}

function getAge(date) {
    let today = new Date();
    let birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

const FormPage = () => {
    const [cities, setCities] = useState([]);
    const [doctorSpecialties, setDoctorSpecialties] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedSex, setSelectedSex] = useState('');
    const [selectedCityId, setSelectedCityId] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState('');
    const [selectedDoctorId, setSelectedDoctorId] = useState('');
    const ref = useRef(null);

    useEffect(() => {
        getAPIRequest('https://run.mocky.io/v3/9fcb58ca-d3dd-424b-873b-dd3c76f000f4', setCities);
        getAPIRequest('https://run.mocky.io/v3/e8897b19-46a0-4124-8454-0938225ee9ca', setDoctorSpecialties);
        getAPIRequest('https://run.mocky.io/v3/3d1c993c-cd8e-44c3-b1cb-585222859c21', setDoctors, setFilteredDoctors);
    }, []);

    const getFilteredDoctors = () => {
        let filteredDoctorsTemp = [...doctors];

        if (selectedDate.length !== 0) {
            if (getAge(selectedDate) < 16) {
                filteredDoctorsTemp = filteredDoctorsTemp.filter(doctor => doctor?.isPediatrician === true);
            } else {
                if (getAge(selectedDate) < 45) {
                    filteredDoctorsTemp = filteredDoctorsTemp.filter(doctor => doctor?.specialityId !== '12');
                }
                filteredDoctorsTemp = filteredDoctorsTemp.filter(doctor => doctor?.isPediatrician === false);
            }
        }

        if (selectedSex.length !== 0) {
            if (selectedSex === 'male') {
                filteredDoctorsTemp = filteredDoctorsTemp.filter(doctor => doctor?.specialityId !== '2' && doctor?.specialityId !== '9');
            } else {
                filteredDoctorsTemp = filteredDoctorsTemp.filter(doctor => doctor?.specialityId !== '3' && doctor?.specialityId !== '8');
            }
        }

        if (selectedCityId.length !== 0) {
            filteredDoctorsTemp = filteredDoctorsTemp.filter(doctor => doctor?.cityId === selectedCityId);
        }

        if (selectedSpeciality.length !== 0) {
            filteredDoctorsTemp = filteredDoctorsTemp.filter(doctor => doctor?.specialityId === selectedSpeciality);
        }

        setFilteredDoctors(filteredDoctorsTemp);
    }

    useEffect(() => {
        getFilteredDoctors();
    }, [selectedDate, selectedSex, selectedCityId, selectedSpeciality]);

    useEffect(() => {
        let arr = doctors.filter(doctor => doctor.id === selectedDoctorId)
        if(arr[0]?.cityId && arr[0]?.specialityId) {
            setSelectedCityId(arr[0]?.cityId);
            ref.current.values.city = arr[0]?.cityId;
            setSelectedSpeciality(arr[0]?.specialityId);
            ref.current.values.specialty = arr[0]?.specialityId;
        }
    }, [selectedDoctorId]);

    const onSubmit = (values) => {
        console.log(values);
        alert('Form sent! Details in console.')

        // axios.post('/', values)
        //     .then(response => {
        //         console.log(response.data);
        //     })
        //     .catch(error => {
        //         console.log(error);
        //     })
    };

    return (
        <Formik
            innerRef={ref}
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            {({values}) => (
                <Form className={styles.form}>
                    <div className={styles.formFieldArea}>
                        <label className={styles.formFieldLabel} htmlFor="name">Ім'я:</label>
                        <Field className={styles.formField} type="text" id="name" name="name" />
                        <ErrorMessage className={styles.formFieldError} name="name" component="div" />
                    </div>

                    <div className={styles.formFieldArea}>
                        <label className={styles.formFieldLabel} htmlFor="date">Дата народження:</label>
                        <input className={styles.formField} type="date" id="date" name="date" onChange={(e) => {values.date = e.target.value; values.doctor = ""; setSelectedDate(e.target.value)}} />
                        <ErrorMessage className={styles.formFieldError} name="date" component="div" />
                    </div>

                    <div className={styles.formFieldArea}>
                        <label className={styles.formFieldLabel} htmlFor="gender">Стать:</label>
                        <select defaultValue={""} className={styles.formFieldSelector} id="gender" name="gender" onChange={(e) => {values.gender = e.target.value; values.doctor = ""; setSelectedSex(e.target.value)}}>
                            <option value="" disabled hidden>Оберіть стать</option>
                            <option value="male">Чоловік</option>
                            <option value="female">Жінка</option>
                        </select>
                        <ErrorMessage className={styles.formFieldError} name="gender" component="div" />
                    </div>

                    <div className={styles.formFieldArea}>
                        <label className={styles.formFieldLabel} htmlFor="city">Місто:</label>
                        <select className={styles.formFieldSelector} value={selectedCityId} id="city" name="city" onChange={(e) => {values.city = e.target.value; values.doctor = ""; setSelectedCityId(e.target.value)}}>
                            <option value="" disabled hidden>Оберіть місто</option>
                            {cities.map(city => (
                                <option key={city.id} value={city.id}>{city.name}</option>
                            ))}
                        </select>
                        <ErrorMessage className={styles.formFieldError} name="city" component="div" />
                    </div>

                    <div className={styles.formFieldArea}>
                        <label className={styles.formFieldLabel} htmlFor="specialty">Спеціальність лікаря:</label>
                        <select className={styles.formFieldSelector} value={selectedSpeciality} id="specialty" name="specialty" onChange={(e) => {values.specialty = e.target.value; values.doctor = ""; setSelectedSpeciality(e.target.value)}}>
                            <option value="" disabled hidden>Оберіть спеціальність лікаря</option>
                            {doctorSpecialties.map(specialty => (
                                <option key={specialty.id} value={specialty.id}>{specialty.name}</option>
                            ))}
                        </select>
                        <ErrorMessage className={styles.formFieldError} name="specialty" component="div" />
                    </div>

                    <div className={styles.formFieldArea}>
                        <label className={styles.formFieldLabel} htmlFor="doctor">Лікар:</label>
                        <select value={selectedDoctorId} className={styles.formFieldSelector} id="doctor" name="doctor" onChange={(e)=>{values.doctor = e.target.value; setSelectedDoctorId(e.target.value)}}>
                            <option value="" disabled hidden>Оберіть лікаря</option>
                            {filteredDoctors.map(doctor => (
                                <option key={doctor?.id} value={doctor.id}>{doctor?.name} {doctor?.surname} ({doctorSpecialties?.map((el) => el.id == doctor?.specialityId && el.name)})</option>
                            ))}
                        </select>
                        <ErrorMessage className={styles.formFieldError} name="doctor" component="div" />
                    </div>

                    <div className={styles.formFieldArea}>
                        <label className={styles.formFieldLabel} htmlFor="email">Електронна пошта:</label>
                        <Field className={styles.formField} type="email" id="email" name="email" />
                        <ErrorMessage className={styles.formFieldError} name="email" component="div" />
                    </div>

                    <div className={styles.formFieldArea}>
                        <label className={styles.formFieldLabel} htmlFor="phone">Номер телефону:</label>
                        <Field className={styles.formField} type="tel" id="phone" name="phone" />
                        <ErrorMessage className={styles.formFieldError} name="phone" component="div" />
                    </div>

                    <button className={styles.submitBtn} type="submit">Відправити</button>
                </Form>
            )}
        </Formik>
    );
};

export default FormPage;

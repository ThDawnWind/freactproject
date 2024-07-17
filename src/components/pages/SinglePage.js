import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

import useMarvelService from '../../services/MarvelService';
import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';
import AppBanner from "../appBanner/AppBanner";

// Хотелось бы вынести функцию по загрузке данных как отдельный аргумент
// Но тогда мы потеряем связь со стэйтами загрузки и ошибки
// А если вынесем их все в App.js - то они будут одни на все страницы

const SinglePage = ({ Component, dataType }) => {
    const { comicId } = useParams();
    const [data, setData] = useState(null);
    const { loading, error, getComic, getCharacter, clearError } = useMarvelService();

    useEffect(() => {
        updateData()
    }, [comicId])

    const updateData = () => {
        clearError();

        switch (dataType) {
            case 'comic':
                getComic(comicId).then(onDataLoaded);
                break;
            case 'character':
                getCharacter(comicId).then(onDataLoaded);
        }
    }

    const onDataLoaded = (data) => {
        setData(data);
    }

    const errorMessage = error ? <ErrorMessage /> : null;
    const spinner = loading ? <Spinner /> : null;
    const content = !(loading || error || !data) ? <Component data={data} /> : null;

    return (
        <>
            {errorMessage}
            {spinner}
            {content}
        </>
    )
}

export default SinglePage;
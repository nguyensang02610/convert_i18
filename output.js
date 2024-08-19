/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactDOM from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import './KhoiTaoHoSo.css';
import './Popup.css';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { parse, format, isBefore, differenceInYears, isValid } from 'date-fns';
import $ from 'jquery';
import { useRef } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import NotificationAlert from "react-notification-alert";
import { useDispatch, useSelector } from 'react-redux';
import SelectField from '../../../components/FieldInput/SelectField';
import TextField from '../../../components/FieldInput/TextField';
import { PopupType, WPopup } from '../../../components/Popup/Popup';
import Select2 from '../../../components/select2/Select2';
import { Ultis, convertStringToInt } from '../../../core/utils';
import BaoHiemDA from '../../../redux/middleware/api/BaoHiem/BaoHiemDA';
import DTIDA from '../../../redux/middleware/api/DTI/DTIDA';
import { getEducationLevelList, getListRelationship, getProvincesList, getPurposeList, getcareerList, getdistrictsList, getresidentList, gettitleList, getwardsList } from '../../../redux/middleware/api/Filter/Filter';
import ChuongTrinhVayDA from '../../../redux/middleware/api/W_ChuongTrinhVay/ChuongTrinhVayDA';
import { checkActor, generateUsername, getCheckHaveResultCicPcb, getDuNoKhachHang, getListManufactureV2, getTaskDetail, get_LisCTVByDealerCode, get_LisDealerByProductCode, get_listRejectReson, hoSo_doneAction, layTongChiTieuTheoVung, ngayHopDongDuKien, syncCheckBCA } from '../../../redux/middleware/api/congvieccuatoi/CongViecDA';
import { getMyWorkTime } from '../../../redux/reducer/CommonReducer';
import { SUMMARIES } from '../../../redux/reducer/MenuLeftReducer';
import { SET_MESSAGE } from '../../../redux/reducer/NotificationRuducer';
import { checkAgeLoanDA, checkOnOffTotalLoan, getSuggestedMonthlyPayment } from '../../../redux/middleware/api/KhoiTao/KhoiTaoAPI'
import { ImageNFC, ThongTinKhoiTao } from '../../CongViecCuaToi/CommonView';
import Loader from '../../../components/Loader/index';
import PopupXemQuyTrinh from '../ThamDinh-XuLy-TheChap/PopupXemQuyTrinh';
import GoodsInformations from './components/GoodsInformations';
import PopupCreateAccount from './PopupCreateAccount';
import notiUtil from '../../../core/ToarstNoti.js';
import TableAttachDoc from './TableAttachDoc';
import { checkStatusBca } from '../../../utils/index.js';
import SpouseInfoML from './components/SpouseInfoML';
import { allDataSpouseML, contractSaleInfo, keyNameCurrency } from './const/khoitao.const';
import LoanProgramAndProduct from './components/LoanProgramAndProduct';
import LoanInfomationML from './components/LoanInfomationML';
import SaleContractInfo from './components/SaleContractInfo';
import CustomerFinace from './components/CustomerFinace';
import { checkDates, checkExpiredDate, checkNgaySinh, checkProviedDate, validateIdentityCardNumber, validateIdentityCardNumberWithGender } from './const/khoitao.func';
import RowInfo from './components/RowInfo';
import { checkLoanStatus } from '../../../redux/middleware/api/hosovay/HoSoVayDA.js';
import { KHOI_TAO_HO_SO } from '../../../const/const';

const POOLING_TIME_DEFAULT = 1000 * 60 * 1;

const defaultValue = {
    losProductGoods: [{
        manufacturer: "",
        manufacturerCode: "",
        label: "",
        labelCode: "",
        yearCreated: null,
        color: "",
        unitPrice: '',
        quantity: ''
    }]
}

export default function KhoiTaoHoSo() {
    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        setError,
        clearErrors,
        watch,
        formState: { errors }
    } = useForm({
        shouldFocusError: false,
        defaultValues: defaultValue
    });
    const { t: i18 } = useTranslation(KHOI_TAO_HO_SO);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const notificationAlert = useRef();
    const noteRef = useRef(null);
    const workTimeStore = useSelector((store) => store?.common.workTime);
    const [scrollIndex, setScroll] = useState(0);
    const [sendloading, setSendLoading] = useState(false);
    const [saveloading, setsaveloading] = useState(false);
    const [data, setData] = useState();
    const [processVariables, setProcessVariables] = useState({});
    const [customerItem, setCustomerItem] = useState({});
    const [settingData, setSettingData] = useState({});
    const [responseCheckCicPcb, setResponseCheckCicPcb] = useState();
    const [nfc, setNfc] = useState();
    const [listDealer, updateListDealer] = useState([]);
    const [selected_loanProgram, update_selectedLoanProgram] = useState({});
    const [listLoanProgram, updateListLoanProgram] = useState([]);
    const [list_manufacture, update_listManufacture] = useState([]);
    const [list_loanTerm, update_listLoanTerm] = useState([]);
    const [list_paymentData, update_listPaymentDate] = useState([]);
    const [danhSachMucDich, setMucDichVay] = useState([]);
    const [danhSachNhaCungCapBHBB, setdanhSachNhaCungCapBHBB] = useState([]);
    const [danhSachNhaCungCapBHTN, setdanhSachNhaCungCapBHTN] = useState([]);
    const [danhSachTrinhDoHocVan, setTrinhDoHocVan] = useState([]);
    const [danhSachTinhThanhPho, setTinhThanhPho] = useState([]);
    const [danhSachQuanHuyen, setQuanHuyen] = useState([]);
    const [danhSachPhuongXa, setPhuongXa] = useState([]);
    const [danhSachQuanHuyenThuongTru, setQuanHuyenThuongTru] = useState([]);
    const [danhSachPhuongXaThuongTru, setPhuongXaThuongTru] = useState([]);
    const [danhSachTinhTrangCuTru, setTinhTrangCuTru] = useState([]);
    const [danhSachQuanHe2, setQuanHe2] = useState([]);
    const [danhSachQuanHe1, setQuanHe1] = useState([]);
    const [danhSachNgheNghiep, setNgheNghiep] = useState([]);
    const [danhSachChucVu, setChucVu] = useState([]);
    const [listDocument, setListDocument] = useState([]);
    const [thoatKhoiTao, setThoatKhoiTao] = useState(false);
    const [huyKhoiTao, setHuyKhoiTao] = useState(false);
    const [popupTuanThu, setPopupTuanThu] = useState(false);
    const [deXuatKhoangVay, setDeXuatKhoangVay] = useState(false);
    const [isDinhDangFile, setDinhDangFile] = useState(false);
    const [isKichThuocFile, setKichThuocFile] = useState(false);
    const [duNoKhachHang, setDuNoKhachHang] = useState();
    const [showPopupDuNo, setPopupDuNo] = useState(false);
    const [cicPcb_khongThoaMan, setKhongThoaManCic] = useState();
    const [cicPcb_quaThoiGian, setQuaThoiGianCic] = useState();
    const [taskID, setTaskID] = useState();
    const [listRejectReson, setListRejectReson] = useState([]);
    const [popupCreateAccount, setPopupCreateAccount] = useState(false);
    const [userGenerate, setUserGenerate] = useState({});
    const [disableCTV, setDisableCTV] = useState(false);
    const [showPopupDC, setShowPopupDC] = useState(false);
    const [isPassDTI, setPassDTI] = useState(true);
    const [showProcess, onShowProcess] = useState(false);
    const [loanApplicaionId, setLoanApplicaionId] = useState();
    const [isExitTime, setIsExitTime] = useState(false);
    const [isCheckAddressChip, setIsCheckAddressChip] = useState(true);
    const [checkDcThuongTru, setCheckDcThuongTru] = useState(0);
    const [checkProvinceThuongTru, setCheckProvinceThuongTru] = useState(0);
    const [checkDistrictThuongTru, setCheckDistrictThuongTru] = useState(0);
    const [checkWardThuongTru, setCheckWardThuongTru] = useState(0);
    const [provinceTempName, setProvinceTempName] = useState('');
    const [districtTempName, setDistrictTempName] = useState('');
    const [wardTempName, setWardTempName] = useState('');
    const [customerAge, setCustomerAge] = useState();
    const [checkNgayKiHDEdit, setCheckNgayKiHDEdit] = useState(0);
    const [disableCccdCu, setDisableCccdCu] = useState(false);
    const [chungTuThanhToan, setChungTuThanhToan] = useState();
    const [listFileLoanTemp, setListFileLoanTemp] = useState([]);
    const [typeCheckBCA, setTypeCheckBCA] = useState('');
    const [checkTotalLoan, setCheckTotalLoan] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingAddress, setIsLoadingAddress] = useState(false);
    const [isHaveSpouse, setIsHaveSpouse] = useState(false);
    const [spouseData, setSpouseData] = useState();
    const [salesContractInformation, setSalesContractInformation] = useState();
    const [isHaveCompulsoryInsurance, setIsHaveCompulsoryInsurance] = useState(false);
    const [isHaveVoluntaryInsurance, setIsHaveVoluntaryInsurance] = useState(false);

    const { fields: insurance, remove: removeInsurance } = useFieldArray({
        control,
        name: 'loanApplicationInsurance',
        keyName: 'GID',
    });

    const { fields: fileHoSo, append: addFileHoSoEvent, remove: removeFileHoSoEvent } = useFieldArray({
        control,
        name: 'fileLoanApplication',
        keyName: 'GID',
    });

    const { fields: spouseFiles } = useFieldArray({
        control,
        name: 'spouseFiles',
        keyName: 'GID',
    });

    const { fields: losProductGoods } = useFieldArray({
        control,
        name: 'losProductGoods',
    });

    const noScrollElements = ["b34d481e-f2e3-465e-9be4-da1e0879e6ee", "047ab5fa-da22-4b70-bf1b-1cb956c430a0"]

    let list_sidebar_content = [
        i18("THONG_TIN_EKYC_KHACH_HANG"),
        i18("THONG_TIN_NGUOI_HON_PHOI"),
        i18("CHUONG_TRINH_VAY_VA_SAN_PHAM"),
        i18("THONG_TIN_HOP_DONG_MUA_BAN"),
        i18("THONG_TIN_HANG_HOA"),
        i18("THONG_TIN_KHOAN_VAY"),
        i18("BAO_HIEM"),
        i18("THONG_TIN_KHACH_HANG_BO_SUNG"),
        i18("CONG_VIEC_KHACH_HANG"),
        i18("TAI_CHINH_KHACH_HANG"),
        i18("THONG_TIN_NGUOI_LIEN_QUAN"),
        i18("CHUNG_TU_DINH_KEM"),
        i18("GHI_CHU")
    ];

    list_sidebar_content = useMemo(() => {
        if (isHaveSpouse == false) {
            list_sidebar_content = list_sidebar_content.filter(item => item !== i18("THONG_TIN_NGUOI_HON_PHOI"));
        }
        if (isHaveCompulsoryInsurance == false) {
            list_sidebar_content = list_sidebar_content.filter(item => item !== i18("BAO_HIEM"));
        }
        return list_sidebar_content;
    }, [list_sidebar_content, isHaveSpouse, isHaveCompulsoryInsurance]);

    const clickScrollTo = (event) => {
        let optionList = [...event.target.parentElement.children];
        let index = optionList.indexOf(event.target);
        let scrollElement = document.querySelector(`.wbaseItem-value[class*="14d79961-33c6-4084-9373-97ac9758052b"]`);
        let filterChildren = [...scrollElement.firstChild.children].filter((e) => !noScrollElements.some(cls => e.className.includes(cls)));
        const maxScroll = scrollElement.scrollHeight - scrollElement.offsetHeight;
        if (Math.abs(maxScroll - scrollElement.scrollTop) < 1 && [...scrollElement.firstChild.children][index].offsetTop > maxScroll) {
            for (let i = 0; i < optionList.length; i++) {
                if (i === index) {
                    optionList[i].classList.add("selected-mini-sidebar-option");
                } else {
                    optionList[i].classList.remove("selected-mini-sidebar-option");
                }
            }
        } else {
            filterChildren[index].setAttribute("focus-block", true);
            scrollElement.scrollTo({
                top: filterChildren[index].offsetTop,
                behavior: "smooth",
            });
        }
    }

    const handleScroll = (event) => {
        const maxScroll = event.target.scrollHeight - event.target.offsetHeight;
        let focusBlock = event.target.querySelector(`div[focus-block="true"]`);
        if (focusBlock) {
            let index = [...event.target.firstChild.children].filter((e) => !noScrollElements.some(cls => e.className.includes(cls))).indexOf(focusBlock);
            let optionList = [...document.querySelector(".sidebar-list-option").children];
            for (let i = 0; i < optionList.length; i++) {
                if (i === index) {
                    optionList[i].classList.add("selected-mini-sidebar-option");
                } else {
                    optionList[i].classList.remove("selected-mini-sidebar-option");
                }
            }
            if (Math.abs(event.target.scrollTop - focusBlock.offsetTop) <= 1 || maxScroll === Math.ceil(event.target.scrollTop)) {
                setTimeout(() => { focusBlock.removeAttribute("focus-block"); }, 150);
            }
        } else {
            let scrollFrom = event.target.getBoundingClientRect().y;
            let scrollTo = [...event.target.firstChild.children].filter((e) => !noScrollElements.some(cls => e.className.includes(cls))).filter(e => {
                let eRect = e.getBoundingClientRect();
                return (eRect.y + eRect.height / 2) > scrollFrom;
            }).sort((a, b) => {
                let aRect = a.getBoundingClientRect();
                let bRect = b.getBoundingClientRect();
                return (aRect.y + aRect.height / 2) - (bRect.y + bRect.height / 2);
            });
            let index = [...event.target.firstChild.children].filter((e) => !noScrollElements.some(cls => e.className.includes(cls))).indexOf(scrollTo[0]);
            let optionList = [...document.querySelector(".sidebar-list-option").children];
            for (let i = 0; i < optionList.length; i++) {
                if (i === index) {
                    optionList[i].classList.add("selected-mini-sidebar-option");
                } else {
                    optionList[i].classList.remove("selected-mini-sidebar-option");
                }
            }
        }
    }

    const noteTitleList = [i18("CONG_VIEC"), i18("HANG_HOA"), i18("NOI_O_HIEN_TAI"), i18("THONG_TIN_NGUOI_LIEN_QUAN"), i18("KHAC")];

    const onClickNote = (item) => {
        let note = watch("saleGhiChuKhoiTaoNhap");
        setValue("saleGhiChuKhoiTaoNhap", (note != null && note !== "" ? note + '\n' : "") + item + ": ");
    }

    const subId = location.search.replace("?", "");

    const get_danhSachLyDoHuy = async () => {
        let res = await get_listRejectReson();
        if (res) {
            setListRejectReson(res);
        } else {
            setListRejectReson([]);
        }
    }

    const get_danhSachDaiLy = async (userName, productCode, dealerName) => {
        let data = {
            "username": localStorage.getItem("username") || '',
            "productCode": productCode,
            "dealerName": dealerName ?? "",
        }
        let res = await get_LisDealerByProductCode(data);
        if (res) {
            updateListDealer(res);
            return res;
        } else {
            updateListDealer([]);
            return [];
        }
    }

    const get_danhSachChuongTrinhVay = async (dealerCode, productCode) => {
        let data = {
            "dealerCode": dealerCode,
            "productCode": productCode,
            "groupId": ""
        }
        let res = await get_LisCTVByDealerCode(data);

        if (res != null) {
            updateListLoanProgram(res ?? []);
            setDisableCTV(true);
        }
    }

    const get_loanProgramDetailsByCode = async (code) => {
        let res = await ChuongTrinhVayDA.getDetailLoanProgramByCode2(code);
        if (res != null) {
            return res;
        } else {
            return null;
        }
    }

    const tinhTongBaoHiem = (insuranceData) => {
        let tong = 0;
        (insuranceData ?? []).forEach((item) => {
            if (item.maHinhThucThanhToan === BaoHiemDA.THANH_TOAN_GOP_VAO_KHOAN_VAY_CODE && item.action != "delete") {
                tong += parseFloat(item.phiBaoHiem ?? 0);
            }
        });
        tong = tong.toFixed(0);
        let tongKhoanVay = Number(getValues("soTienVayGoc")) + Number(tong);
        setValue("soTienBaoHiem", tong);
        setValue("tongKhoanVay", tongKhoanVay.toFixed(0));
        tinhKetQuaDTI(getValues(), false);
    }

    const calculate_feeInsurance = (list_insurance) => {
        list_insurance?.forEach((item) => {
            let _phiBaoHiem = 0;
            if (item.maLoaiTinhPhi == "KTP1") {
                _phiBaoHiem = Ultis.tryParseFloat(getValues("soTienVayGoc")) * item.tyLeBaoHiem / 100 * Ultis.tryParseInt(getValues("kyHanVay"))
            } else {
                _phiBaoHiem = item.phiBaoHiem;
            }
            item.phiBaoHiem = _phiBaoHiem;
            item.soTienBaoHiem = Ultis.tryParseFloat((watch("soTienVayGoc") * item.tyLeSoTienDuocBaoHiem / 100).toFixed(0));
        });
        setValue("loanApplicationInsurance", list_insurance ?? []);
        if (checkTotalLoan) {
            const tongKhoanVay = parseInt(watch("tongKhoanVay"));
            const duNo = parseInt(duNoKhachHang);
            if ((tongKhoanVay + duNo) > parseInt(checkTotalLoan)) {
                setPopupDuNo(true);
            }
        }
        tinhTongBaoHiem(list_insurance);
    }

    const update_dataByLoanProgram = async ({ loanProgram, updateLoanProgram, settingData }) => {
        const _isHaveCompulsoryInsurance = loanProgram?.insuranceDetails?.length > 0;
        const _isHaveVoluntaryInsurance = loanProgram?.insuranceVoluntaryDetails?.length > 0;
        const checkCompulsoryInsurance = settingData?.loanApplicationInsurance?.length > 0;
        setIsHaveCompulsoryInsurance(_isHaveCompulsoryInsurance || checkCompulsoryInsurance);
        setIsHaveVoluntaryInsurance(_isHaveVoluntaryInsurance);
        if (loanProgram) {
            update_selectedLoanProgram(loanProgram);
        }
        else {
            loanProgram = selected_loanProgram;
        }
        if (updateLoanProgram) {
            let _tmp = [...settingData.loanApplicationInsurance.filter((e) => !e.isNew)];
            _tmp.forEach((e) => e.action = "delete");
            settingData.loanApplicationInsurance = _tmp;
        }
        if (settingData.minimumPayment == null) {
            setValue("minimumPayment", loanProgram.data.minimumPayment);
        }
        const _listBrandID = loanProgram.brandManagements.map((obj) => obj.id);
        if (_listBrandID !== '') {
            const _res_manufacture = await getListManufactureV2(_listBrandID, 1, 1000000);
            if (_res_manufacture) {
                update_listManufacture(_res_manufacture.content);
            }
        } else {
            update_listManufacture([]);
        }
        update_listLoanTerm(loanProgram.facilityMas ?? []);
        let _selectedLoanTerm = loanProgram.facilityMas.find((e) => e.promotionCode === settingData.promotionCode);
        if (_selectedLoanTerm) {
            setValue('kyHanVay', _selectedLoanTerm.stdTenor);
            setValue('kyHanGiaiDoan1', _selectedLoanTerm.modNo === 1 ? _selectedLoanTerm.stdTenor : _selectedLoanTerm.fixedPeriod ?? "")
            setValue('laiSuatGiaiDoan1', _selectedLoanTerm.modNo === 1 ? getLSgiaiDoan1(loanProgram.facilityDets, settingData.promotionCode) : (_selectedLoanTerm.fixedRate ?? ""))
            setValue('kyHanGiaiDoan2', _selectedLoanTerm.modNo === 1 ? null : _selectedLoanTerm.stdTenor - _selectedLoanTerm.fixedPeriod)
            setValue('laiSuatGiaiDoan2', _selectedLoanTerm.modNo === 1 ? null : _selectedLoanTerm.intrateRatecode)
        } else {
            setValue('kyHanVay', "");
            setValue('promotionCode', "");
            setValue('kyHanGiaiDoan1', "");
            setValue('laiSuatGiaiDoan1', "");
            setValue('kyHanGiaiDoan2', "");
            setValue('laiSuatGiaiDoan2', "");
        }
        if (updateLoanProgram || (settingData.loanApplicationInsurance == null || settingData.loanApplicationInsurance.length === 0)) {
            if (loanProgram.insuranceDetails != null && loanProgram.insuranceDetails.length > 0) {
                let list_compulsoryInsurance = [];
                list_compulsoryInsurance.push({
                    'maNhaCungCap': null,
                    'isRequired': true,
                    'isNew': true
                });
                settingData.loanApplicationInsurance = [...settingData.loanApplicationInsurance ?? [], ...list_compulsoryInsurance];
            }
        } else {
            settingData.loanApplicationInsurance.forEach((item) => {
                let _insuranceDetails;
                if (item.isRequired == true) {
                    _insuranceDetails = loanProgram.insuranceDetails.find((e) => item.maBaoHiem == e.insuranceCode && item.maNhaCungCap == e.insuranceSupplier);
                    if (_insuranceDetails)
                        item.paymentTypes = _insuranceDetails.paymentTypes;
                } else {
                    _insuranceDetails = loanProgram.insuranceVoluntaryDetails.find((e) => item.maBaoHiem == e.insuranceCode && item.maNhaCungCap == e.insuranceSupplier);
                    if (_insuranceDetails)
                        item.paymentTypes = _insuranceDetails?.paymentTypes ?? [];
                }
                item.tyLeSoTienDuocBaoHiem = _insuranceDetails?.rateCovered ?? 100;
            })
        }
        const uniqueInsuranceSuppliers1 = {};
        const uniqueInsuranceSuppliers2 = {};
        loanProgram.insuranceDetails.forEach(item => {
            uniqueInsuranceSuppliers1[item.insuranceSupplier] = item;
        });
        loanProgram.insuranceVoluntaryDetails.forEach(item => {
            uniqueInsuranceSuppliers2[item.insuranceSupplier] = item;
        });
        const uniqueInsuranceList1 = Object.values(uniqueInsuranceSuppliers1);
        const uniqueInsuranceList2 = Object.values(uniqueInsuranceSuppliers2);
        setdanhSachNhaCungCapBHBB(uniqueInsuranceList1);
        setdanhSachNhaCungCapBHTN(uniqueInsuranceList2);
        let danhSachChungTu = [];
        const uniqueFileType = [];

        danhSachChungTu = loanProgram.documentDetails.filter(item => {
            if (!uniqueFileType.includes(item.documentCode) && item.documentTypeCode !== "CT2") {
                uniqueFileType.push(item.documentCode);
                return true;
            }
            return false;
        }).map(item => ({
            documentCode: item.documentCode,
            documentName: item.documentName
        }));
        setListDocument(danhSachChungTu);

        loanProgram.data.maximumPrepaymentPercent ??= 100;
        if (processVariables?.khachHang != null) {
            let khachangAge = Ultis.calculateAge(processVariables?.khachHang?.ngaySinh);
            if (khachangAge < loanProgram.data.minimumAgeLimit) {
                setError("maChuongTrinhVay", { message: i18("DO_TUOI_KHACH_HANG_KHONG_DAT_DO_TUOI_TOI_THIEU_CUA_CHUONG_TRINH_VAY") });
            } else if (khachangAge > loanProgram.data.maximumAge) {
                setError("maChuongTrinhVay", { message: i18("DO_TUOI_KHACH_HANG_VUOT_QUA_DO_TUOI_TOI_DA_CUA_CHUONG_TRINH_VAY") });
            } else if (errors.maChuongTrinhVay) {
                clearErrors("maChuongTrinhVay")
            }
        }
        if (loanProgram.data?.minimumPrepaymentPercent != null && updateLoanProgram) {
            settingData.tyLeTraTruoc = loanProgram.data.minimumPrepaymentPercent;
            setValue("tyLeTraTruoc", loanProgram.data.minimumPrepaymentPercent);
            if (Ultis.tryParseFloat(getValues("tongGiaBan")) > 0) {
                let soTienTraTruoc = Ultis.tryParseFloat(getValues("tongGiaBan")) * loanProgram.data.minimumPrepaymentPercent / 100;
                settingData.soTienTraTruoc = soTienTraTruoc;
                setValue("soTienTraTruoc", soTienTraTruoc);
            }
        }

        if (loanProgram != null && (Ultis.tryParseFloat(getValues("tyLeTraTruoc")) > 0 || Ultis.tryParseFloat(getValues("soTienTraTruoc")) > 0) && Ultis.tryParseFloat(getValues("tongGiaBan")) > 0) {
            if (settingData.tyLeTraTruoc < loanProgram?.data?.minimumPrepaymentPercent) {
                setError("tyLeTraTruoc", { message: i18("TY_LE_TRA_TRUOC_TOI_THIEU_CHO_CHUONG_TRINH_VAY_LA_MINIMUMPREPAYMENTPERCENT", { minimumPrepaymentPercent: loanProgram?.data?.minimumPrepaymentPercent }) });
            } else if (settingData.tyLeTraTruoc > loanProgram?.data?.maximumPrepaymentPercent) {
                setError("tyLeTraTruoc", { message: i18("TY_LE_TRA_TRUOC_TOI_DA_CHO_CHUONG_TRINH_VAY_LA_MAXIMUMPREPAYMENTPERCENT", { maximumPrepaymentPercent: loanProgram?.data?.maximumPrepaymentPercent }) });
            } else {
                clearErrors("tyLeTraTruoc");
            }


            if (settingData.soTienVayGoc < loanProgram?.data?.minimumLoanAmount) {
                setError("soTienVayGoc", { message: `i18("SO_TIEN_VAY_GOC") tối thiểu của chương trình vay là: ${Ultis.money(loanProgram?.data?.minimumLoanAmount)} VND` })
            } else if (settingData.soTienVayGoc > loanProgram?.data?.maximumLoanAmount) {
                setError("soTienVayGoc", { message: `i18("SO_TIEN_VAY_GOC") tối đa của chương trình vay là: ${Ultis.money(loanProgram?.data?.maximumLoanAmount)} VND` })
            } else {
                clearErrors("soTienVayGoc");
            }
        } else {
            clearErrors("tyLeTraTruoc");
            clearErrors("tyLeTraTruoc");
            clearErrors("soTienVayGoc");
        }
        tinhTongBaoHiem(settingData.loanApplicationInsurance);
        setValue('loanApplicationInsurance', settingData.loanApplicationInsurance);
        let listFileRequiredCTV = loanProgram.documentDetails.filter((e) => e.documentTypeCode === "CT2")?.map(item => ({
            tenFileCtv: item?.documentName,
            maFileCtv: item?.documentCode,
            documentCode: item?.documentCode,
            documentName: item?.documentName,
            documentGroupCode: item?.documentGroupCode,
            documentGroupName: item?.documentGroupName,
            checkYeuCauChinhSua: null,
            data: [],
            isRequired: 1,
        }));
        setValue("fileLoanApplicationFrame1", listFileRequiredCTV);
    }

    useEffect(() => {
        const frameParent = [...watch('fileLoanApplicationFrame1') || [], ...watch('fileLoanApplicationFrame2') || []]
        const _frameParent = frameParent.map(item => ({ ...item, data: listFileLoanTemp?.filter(item2 => item2.maFileCtv == item.maFileCtv) || [] }))
        if (listFileLoanTemp?.length > 0) {
            var groupedData = {};
            listFileLoanTemp?.forEach(function (obj) {
                var key = obj.maFileCtv;
                if (!groupedData[key]) {
                    groupedData[key] = [];
                }
                groupedData[key].push(obj);
            });
            const dataTemp = Object.values(groupedData)?.map(item => ({
                ten: item[0].ten,
                tenFileCtv: item[0].tenFileCtv,
                documentName: item[0].tenFileCtv,
                documentCode: item[0]?.maFileCtv,
                maFileCtv: item[0]?.maFileCtv,
                isRequired: item[0]?.isRequired,
                checkYeuCauChinhSua: null,
                isDelete: item?.every((item1) => (!item1?.isRequired)),
                data: item || [],
            }))
            //Gộp mảng
            dataTemp.forEach(itemB => {
                const foundIndex = _frameParent.findIndex(itemA => itemA.maFileCtv === itemB.maFileCtv);
                if (foundIndex !== -1) {
                    _frameParent.splice(foundIndex, 1, itemB);
                } else {
                    _frameParent.push(itemB);
                }
            });

        }

        setValue('fileLoanApplication', _frameParent)
    }, [listFileLoanTemp, watch('fileLoanApplicationFrame1'), watch('fileLoanApplicationFrame2')]);

    const getLSgiaiDoan1 = (listItem, promotionCode) => {
        let output = listItem.find((e) => e.promotionCode === promotionCode && e.udeId === "INTEREST_RATE");
        return output?.udeValue ?? 0
    }

    const getDanhSachMucDich = async (code) => {
        let res = await getPurposeList(1, 10000, code);
        if (res != null) {
            setMucDichVay(res);
        }
    }

    const getDanhSachTrinhDoHocVan = async () => {
        let res = await getEducationLevelList(1, 100, '');
        if (res != null) {
            setTrinhDoHocVan(res.content);
        }
    }

    const getDanhSachTinhThanhPho = async () => {
        let res = await getProvincesList(1, 100, '');
        if (res != null) {
            setTinhThanhPho(res.content);
        }
    }

    const getDanhSachQuanHuyen = async (code) => {
        if (code) {
            const res = await getdistrictsList(1, 100, code);
            if (res != null) {
                setQuanHuyen(res.content);
            } else {
                setQuanHuyen([]);
            }
        }
    }

    const getDanhSachQuanHuyenThuongTru = async (code) => {
        if (code) {
            const res = await getdistrictsList(1, 100, code);
            if (res != null) {
                setQuanHuyenThuongTru(res.content);
                return res.content;
            } else {
                setQuanHuyenThuongTru([]);
                return [];
            }
        }
    }

    const getDanhSachPhuongXaThuongTru = async (code) => {
        if (code) {
            const res = await getwardsList(1, 100, code);
            if (res != null) {
                setPhuongXaThuongTru(res.content);
                return res.content;
            } else {
                setPhuongXaThuongTru([]);
                return [];
            }
        }
    }

    const getDanhSachPhuongXa = async (code) => {
        if (code) {
            let res = await getwardsList(1, 100, code);
            if (res != null) {
                setPhuongXa(res.content);
            } else {
                setPhuongXa([])
            }
        }
    }

    const getDanhSachTinhTrangCuTru = async () => {
        let res = await getresidentList(1, 100);
        if (res != null) {
            setTinhTrangCuTru(res.content);
        }
    }

    const getDanhSachQuanHe = async () => {
        let res1 = await getListRelationship(1, 100, 1);
        if (res1 != null) {
            setQuanHe1(res1.content);
        }
        let res2 = await getListRelationship(1, 100, 2);
        if (res2 != null) {
            setQuanHe2(res2.content);
        }
    }

    const getDanhSachNgheNghiep = async () => {
        let res = await getcareerList(1, 100, '');
        if (res != null) {
            setNgheNghiep(res.content);
        }
    }

    const getDanhSachChucVu = async () => {
        let res = await gettitleList(1, 100);
        if (res != null) {
            setChucVu(res.content);
        }
    }

    const addInsurance = () => {
        let newInsurance = [...watch("loanApplicationInsurance")];
        newInsurance.push({
            "isRequired": false,
            "isNew": true,
        });
        setValue('loanApplicationInsurance', newInsurance);
    }

    const calculateAge = (dobString) => {
        const dob = parse(dobString, 'dd/MM/yyyy', new Date());
        const age = differenceInYears(new Date(), dob);
        return age;
    };

    const checkNgayKyHd = (date) => {
        const ngayHopDongDuKien = parse(date, 'dd-MM-yyyy', new Date())
        const currentDate = new Date();
        const status = isBefore(ngayHopDongDuKien, currentDate.setHours(0, 0, 0, 0)) ? true : false;

        return status;
    }

    const checkTotalLoanFn = async (maSanPham) => {
        const response = await checkOnOffTotalLoan(maSanPham);
        if (response?.code == 200) setCheckTotalLoan(response?.data);
    }

    const isValidDateFormat = (dateString) => {
        const parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
        return isValid(parsedDate) && format(parsedDate, 'dd/MM/yyyy') === dateString;
    };

    const fillDataObject = (data) => {
        Object.keys(data).forEach(key => {
            if (key != "dob" && key != "providedDate" && key != "expiredDate" && key != "daySignContract") {
                const value = data[key];
                setValue(key, value);
            } else {
                const valueDate = data[key];
                if (!isValidDateFormat(valueDate)) {
                    const formattedDate = format(new Date(valueDate), 'dd/MM/yyyy');
                    setValue(key, formattedDate);
                } else {
                    setValue(key, valueDate);
                }
            }
        });
    }

    const initData = async () => {
        setIsLoading(true);
        let res = await getTaskDetail({ id: subId });
        if (res) {
            setResponseCheckCicPcb(res["process-instance-variables"]);
            setTaskID(res["active-user-tasks"]["task-summary"][0]["task-id"]);
            const _processVariables = res['process-instance-variables'];
            const _settingData = _processVariables?.loanApplication; //Sửa theo yêu cầu loilt8
            const _customerItem = _processVariables?.khachHang;
            setNfc(_processVariables?.anhLiveness);
            checkActor({ idHoSo: _processVariables?.loanApplication?.id }).then((response) => {
                if (!response) {
                    navigate('/admin/ho-so-cho-xu-ly');
                }
            })
            if (_settingData?.maritalStatus == "MARRIED") {
                setIsHaveSpouse(true);
                const spouseInfo = _processVariables?.loanApplication?.spouse;
                if (spouseInfo) setSpouseData(spouseInfo);
            }
            if (_settingData?.productCategoryCode == "SECURED") {
                const salesContractInformation = _processVariables?.loanApplication?.salesContractInformation;
                if (salesContractInformation) setSalesContractInformation(salesContractInformation);
            }
            //Check kiểm tra xem khách hàng có cccd hay không
            setDisableCccdCu(_processVariables?.initialConfigKhoiTaoDTO?.alreadyHaveCmnd);
            if (_customerItem) {
                if (_customerItem.cif) {
                    const duNoKhach = await getDuNoKhachHang(_customerItem.cif);
                    if (duNoKhach != null) setDuNoKhachHang(duNoKhach);
                    else setDuNoKhachHang(0);
                }
                setValue("cccdCu", _customerItem.cccdCu);
                setValue("ngayHetHan", _customerItem.ngayHetHan);
                const age = calculateAge(_customerItem?.ngaySinh);
                setCustomerAge(age);
            }
            setValue('maSanPham', _processVariables?.loanApplication?.maSanPham);
            setLoanApplicaionId(_processVariables?.loanApplication?.id || '');
            setIsCheckAddressChip(_settingData?.isDcThuongTruChipQrGiongThuongChu);
            setCheckDcThuongTru(_settingData?.checkDcThuongTru || 0);
            setCheckProvinceThuongTru(_settingData?.checkProvinceThuongTru || 0);
            setCheckDistrictThuongTru(_settingData?.checkDistrictThuongTru || 0);
            setCheckWardThuongTru(_settingData?.checkWardThuongTru || 0);
            setProvinceTempName(_settingData?.addressProvincesName);
            setDistrictTempName(_settingData?.addressDistrictName);
            setWardTempName(_settingData?.addressWardsName);
            if (_processVariables) {
                await get_danhSachDaiLy(_processVariables.userName, _processVariables.product?.productCode);
            }
            if (_settingData != null) {
                if (_settingData.maDaiLy != null) {
                    await get_danhSachChuongTrinhVay(_settingData.maDaiLy, _processVariables.product?.productCode);
                    if (_settingData.maChuongTrinhVay) {
                        let selectedCTV = await get_loanProgramDetailsByCode(_settingData.maChuongTrinhVay);
                        if (selectedCTV) {
                            await update_dataByLoanProgram({ loanProgram: selectedCTV, settingData: _settingData });
                        }
                    }
                }
                if (_settingData?.maSanPham) await checkTotalLoanFn(_settingData?.maSanPham);
                if (_processVariables?.initialConfigKhoiTaoDTO) {
                    const fileInit = _processVariables?.initialConfigKhoiTaoDTO?.fileInitialKhoiTao;
                    let fileKycManuals = [];
                    fileInit?.forEach(item => {
                        if (_settingData?.ekycType == "MANUAL" && item?.documentCode != "CTTTDNCKH") {
                            fileKycManuals = [...fileKycManuals, {
                                tenFileCtv: item?.documentName,
                                maFileCtv: item?.documentCode,
                                documentCode: item?.documentCode,
                                documentName: item?.documentName,
                                documentGroupCode: item?.documentGroupCode,
                                documentGroupName: item?.documentGroupName,
                                checkYeuCauChinhSua: null,
                                data: [],
                                isRequired: 1,
                            }]
                        }
                        if (item.documentCode == "CTTTDNCKH") {
                            setChungTuThanhToan({
                                tenFileCtv: item?.documentName,
                                maFileCtv: item?.documentCode,
                                documentCode: item?.documentCode,
                                documentName: item?.documentName,
                                documentGroupCode: item?.documentGroupCode,
                                documentGroupName: item?.documentGroupName,
                                checkYeuCauChinhSua: null,
                                data: [],
                                isRequired: 1,
                            })
                        }
                    });
                    setValue("fileLoanApplicationFrame2", fileKycManuals);
                }
                setListFileLoanTemp(res["process-instance-variables"]?.loanApplication?.fileLoanApplication)
                getDanhSachMucDich(_processVariables.product?.productCode);
                const isCheckAddress = _settingData?.isDcThuongTruChipQrGiongThuongChu;
                if (isCheckAddress) {
                    getDanhSachQuanHuyenThuongTru(_customerItem.addressProvincesCode || _settingData.provinceCodeTemp);
                    getDanhSachPhuongXaThuongTru(_customerItem.addressDistrictCode || _settingData.districtCodeTemp);
                } else {
                    getDanhSachQuanHuyenThuongTru(_settingData.provinceCodeTemp || _customerItem.addressProvincesCode);
                    getDanhSachPhuongXaThuongTru(_settingData.districtCodeTemp || _customerItem.addressDistrictCode);
                }
                if (_settingData.currentAddressProvincesCode) {
                    getDanhSachQuanHuyen(_settingData.currentAddressProvincesCode);
                }
                if (_settingData.ngayHopDongDuKien == null || _settingData.ngayHopDongDuKien == "") {
                    _settingData.ngayHopDongDuKien = Ultis.datetoStringDefault().replaceAll('/', '-');
                }
                let _res = await ngayHopDongDuKien(1, 100, { 'date': `${_settingData.ngayHopDongDuKien}`.replaceAll("/", "-") });
                if (_res) {
                    update_listPaymentDate(_res.pageData);
                    if (_res.pageData?.includes(_settingData.ngayThanhToanHangThang)) {
                        _settingData.ngayThanhToanHangThang = "";
                    }
                }

                if (_settingData.isTamTruGiongThuongTru == null) {
                    _settingData.isTamTruGiongThuongTru = false;
                }

                if (_settingData.isThanhToanKhoanVayCu == null) {
                    _settingData.isThanhToanKhoanVayCu = false;
                }

                if (_settingData.isNoVayKhac == null) {
                    _settingData.isNoVayKhac = false;
                    _settingData.tongThanhToanNoVayHangThang = null;
                }
                if (_settingData.isThuNhapKhac == null) {
                    _settingData.isThuNhapKhac = false;
                    _settingData.thuNhapKhac = null;
                }
                if (_settingData.isNguoiPhuThuoc == null) {
                    _settingData.isNguoiPhuThuoc = false;
                    _settingData.soNguoiPhuThuoc = null;
                }
                if (_settingData.nghiNgoLuaDao == null) {
                    _settingData.nghiNgoLuaDao = false;
                }
                Object.keys(_settingData).map(fieldName => {
                    if (fieldName != "loanApplicationInsurance" && fieldName != "fileLoanApplication") {
                        setValue(fieldName, _settingData[fieldName]);
                    }
                    return 0;
                });
                tinhTongBaoHiem(_settingData.loanApplicationInsurance);
                setCustomerItem(_customerItem);
                setProcessVariables(_processVariables);
                setSettingData(_settingData);
                setData(res);
                try {
                    const resData = await checkLoanStatus(_settingData.id)
                    if (resData?.code == 400) {
                        dispatch({ type: SET_MESSAGE, title: resData?.message });
                        navigate('/admin/ho-so-cho-xu-ly')
                        return
                    }
                } catch (error) {
                }
                try {
                    const checkBCARes = await syncCheckBCA({ loanId: _processVariables?.loanApplication?.id });
                    if (checkBCARes.code == '200') {
                        setTypeCheckBCA(checkBCARes?.data);
                    }
                } catch (error) {
                    console.log('error check bca', error);
                }
            }
        }
        setIsLoading(false);
    }

    const deleteInsurance = (index) => {
        removeInsurance(index);
        calculate_feeInsurance(watch("loanApplicationInsurance"));
    }

    const tinhKetQuaDTI = async (_settingData, show) => {
        const _isHaveSpouse = _settingData?.maritalStatus == "MARRIED";
        const districtCode = _settingData?.currentAddressDistrictCode; // Huyện của khách hàng, hiện tại
        const districtSpouseCode = _settingData?.currentAddressDistrictCodeSpouse; // Mã Huyện người hôn phối đ/c hiện tại
        const interestRate = parseFloat(`${_settingData.laiSuatGiaiDoan2 == null ? _settingData.laiSuatGiaiDoan1 : _settingData.laiSuatGiaiDoan2}`.replace(" %", ""));  //Phần trăm lãi suất
        const maSanPham = _settingData?.maSanPham; // Mã sản phẩm
        const minimumPayment = _settingData?.minimumPayment; // số tiền thanh toán tối thiểu
        const monthlyIncome = convertStringToInt(_settingData?.thuNhapThang); // i18("THU_NHAP_HANG_THANG")
        const monthlyIncomeSpouse = convertStringToInt(_settingData?.monthlyIncome); // i18("THU_NHAP_HANG_THANG") người hôn phối
        const monthlyLivingExpenses = convertStringToInt(_settingData.chiPhiSinhHoatHangThang); // i18("CHI_PHI_SINH_HOAT")
        const monthlyLivingExpensesSpouse = convertStringToInt(_settingData.livingExpenses);// i18("CHI_PHI_SINH_HOAT") người hôn phối
        const monthlyLoanPaymentAtOtherCreditFinance = convertStringToInt(_settingData.tongThanhToanNoVayHangThang ?? 0); // i18("NO_VAY_KHAC")
        const monthlyLoanPaymentSpouseAtOtherCreditFinance = convertStringToInt(_isHaveSpouse ? (_settingData.totalMonthlyLoanPayment ?? 0) : null);
        const numberDependents = _settingData.soNguoiPhuThuoc ?? 0;
        const otherIncome = convertStringToInt(_settingData.thuNhapKhac ?? 0);
        const otherIncomeSpouse = convertStringToInt(_isHaveSpouse ? (_settingData.otherIncome ?? 0) : null);
        const period = convertStringToInt(_settingData.kyHanVay);
        const prepaymentAmount = convertStringToInt(_settingData.soTienTraTruoc);
        const soTienBaoHiem = convertStringToInt(_settingData.soTienBaoHiem);
        const totalSellingPrice = convertStringToInt(_settingData.tongGiaBan);

        const dataBody = {
            districtCode,
            districtSpouseCode, //Hôn phối
            interestRate,
            maSanPham,
            minimumPayment,
            monthlyIncome,
            monthlyIncomeSpouse, //Hôn phối
            monthlyLivingExpenses,
            monthlyLivingExpensesSpouse, //Hôn phối
            monthlyLoanPaymentAtOtherCreditFinance,
            monthlyLoanPaymentSpouseAtOtherCreditFinance, //Hôn phối
            numberDependents,
            otherIncome,
            otherIncomeSpouse, //Hôn phối
            period,
            prepaymentAmount,
            soTienBaoHiem,
            totalSellingPrice
        };

        const arrayValue = Object.entries(dataBody)
            .filter(([key, value]) => value !== null && value !== undefined && value !== "")
            .map(([key, value]) => ({ [key]: value }));

        if ((_isHaveSpouse && arrayValue.length == 18) || (!_isHaveSpouse && arrayValue.length == 13)) {
            const data = Object.fromEntries(
                Object.entries(dataBody).filter(([key, value]) => value !== null)
            );

            const res = await DTIDA.tinhDTI_V2(data);
            if (res.code === "200") {
                if (show) setDeXuatKhoangVay(true);
                setValue("diemDTI", res.data.dtiInitialNew.point.toFixed(2));
                setValue("ketQuaDTI", res.data.dtiResult);
                setValue("suggestedMonthlyPayment", res.data.totalSuggestedMonthlyPaymentAtJIVF);
            }
            else {
                notiUtil.errors(res.message);
            }
        }
    }

    const onError = () => {
        if (checkWorkTime()) return;
        dispatch({ type: SET_MESSAGE, title: i18("VUI_LONG_NHAP_DAY_DU_CAC_THONG_TIN_BAT_BUOC") });
    }

    const checkSpouse = (data) => {
        const { dob, idCard, providedDate, expiredDate, gender } = data;
        const checkNamSinh = validateIdentityCardNumber(dob, idCard);
        const checkDate = checkDates(providedDate, expiredDate);
        const checkGender = validateIdentityCardNumberWithGender(idCard, dob, gender);
        const checkExpired = checkExpiredDate(expiredDate);
        const checkProvied = checkProviedDate(providedDate);
        const checkNgaySinhWitchProvied = checkNgaySinh(dob, providedDate);

        if (checkNamSinh && checkDate && checkGender && checkExpired && checkProvied && checkNgaySinhWitchProvied) return false;

        if (!checkExpired) {
            dispatch({ type: SET_MESSAGE, title: i18("NGAY_HET_HAN_PHAI_LON_HON_NGAY_HIEN_TAI") });
            return true;
        }
        if (!checkNamSinh) {
            dispatch({ type: SET_MESSAGE, title: i18("NAM_SINH_KHONG_TRUNG_KHOP_VOI_CCCD") });
            return true;
        }
        if (!checkProvied) {
            dispatch({ type: SET_MESSAGE, title: i18("NGAY_CAP_KHONG_DUOC_LON_HON_NGAY_HIEN_TAI") });
            return true;
        }
        if (!checkDate) {
            dispatch({ type: SET_MESSAGE, title: i18("NGAY_CAP_KHONG_DUOC_NHO_HON_NGAY_HET_HAN_CUA_CCCD") });
            return true;
        }
        if (!checkGender) {
            dispatch({ type: SET_MESSAGE, title: i18("GIOI_TINH_KHONG_TRUNG_KHOP_VOI_CCCD") });
            return true;
        }
        if (!checkNgaySinhWitchProvied) {
            dispatch({ type: SET_MESSAGE, title: i18("NGAY_SINH_KHONG_DUOC_LON_HON_NGAY_CAP") });
            return true;
        }

        return false;
    }

    const onSubmit = (dataForm) => {
        if (checkWorkTime()) return;
        if (dataForm?.dtNguoiLienHe1?.trim() == dataForm?.dtNguoiLienHe2?.trim()) {
            dispatch({ type: SET_MESSAGE, title: i18("SO_DIEN_THOAI_CUA_2_NGUOI_LIEN_HE_KHONG_DUOC_GIONG_NHAU") });
            return true;
        }
        if (customerItem?.dtDiDong == dataForm?.dtNguoiLienHe1?.trim() || customerItem?.dtDiDong == dataForm?.dtNguoiLienHe2?.trim()) {
            dispatch({ type: SET_MESSAGE, title: i18("SO_DIEN_THOAI_KHACH_HANG_KHONG_DUOC_TRUNG_VOI_SO_DIEN_THOAI_NGUOI_LIEN_HE") });
            return true;
        }
        if (isHaveSpouse && checkSpouse(dataForm)) return;
        generateUsername({
            payload: {
                phone: customerItem?.dtDiDong,
                idKhachHang: dataForm?.idKhach,
                fullName: customerItem?.hoTen,
            }
        }).then((res) => {
            if (!!res) {
                setPopupCreateAccount(true);
                setUserGenerate({
                    phone: customerItem?.dtDiDong,
                    idKhachHang: dataForm.idKhach,
                    fullName: customerItem?.hoTen,
                    username: res
                })
            }
            else {
                if (checkNgayKiHDEdit) {
                    dispatch({ type: SET_MESSAGE, title: i18("NGAY_KY_HOP_DONG_PHAI_LON_HON_HOAC_BANG_NGAY_HIEN_TAI") });
                    return;
                }
                else if (getValues("ketQuaDTI") != "Đạt") {
                    setPassDTI(false);
                }
                else {
                    setPopupTuanThu(true);
                }
            }
        })
    };

    const replaceEmptyStringsWithNull = (obj) => {
        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                result[key] = obj[key] === "" ? null : obj[key];
            }
        }
        return result;
    };

    const handleDataReturn = () => {
        let newData = getValues();
        let spouse = null;
        let salesContractInformation = null;
        const contract = {
            hoTenNguoiLienHe2: newData?.fullName,
            maQhNguoiLienHe2: "MQH7",
            qhNguoiLienHe2: "Vợ/ Chồng",
            dtNguoiLienHe2: newData?.phoneNumber,
        }
        const contractSpouse = isHaveSpouse ? { ...contract } : {}; //Nếu có người hôn phối thì đẩy thông tin người lh khẩn cấp = thông tin của spouse
        if (isHaveSpouse) {
            spouse = Object.fromEntries(allDataSpouseML.map(key => [key, newData[key]]));
            for (const keyName of keyNameCurrency) {
                if (spouse[keyName] && typeof spouse[keyName] === 'string') {
                    spouse[keyName] = convertStringToInt(spouse[keyName]);
                }
            }
            const contractSaleInfoKeyName = contractSaleInfo({}).map(obj => obj.name);
            salesContractInformation = Object.fromEntries(contractSaleInfoKeyName.map(key => [key, newData[key]]));
            for (const keyName of keyNameCurrency) {
                if (salesContractInformation[keyName] && typeof salesContractInformation[keyName] === 'string') {
                    salesContractInformation[keyName] = convertStringToInt(salesContractInformation[keyName]);
                }
            }
            newData = Object.fromEntries(
                Object.entries(newData).filter(([key]) => !contractSaleInfoKeyName.includes(key))
            );
            newData = Object.fromEntries(
                Object.entries(newData).filter(([key]) => !allDataSpouseML.includes(key))
            );
            spouse = replaceEmptyStringsWithNull(spouse);
        } else {
            spouse = null;
            const contractSaleInfoKeyName = contractSaleInfo({}).map(obj => obj.name);
            salesContractInformation = Object.fromEntries(contractSaleInfoKeyName.map(key => [key, newData[key]]));
            for (const keyName of keyNameCurrency) {
                if (salesContractInformation[keyName] && typeof salesContractInformation[keyName] === 'string') {
                    salesContractInformation[keyName] = convertStringToInt(salesContractInformation[keyName]);
                }
            }
            newData = Object.fromEntries(
                Object.entries(newData).filter(([key]) => !contractSaleInfoKeyName.includes(key))
            );
        }
        salesContractInformation = replaceEmptyStringsWithNull(salesContractInformation);
        const checkAddress = {
            isDcThuongTruChipQrGiongThuongChu: isCheckAddressChip,
            checkDcThuongTru: checkDcThuongTru,
            checkWardThuongTru: checkWardThuongTru,
            checkDistrictThuongTru: checkDistrictThuongTru,
            checkProvinceThuongTru: checkProvinceThuongTru,
            checkDcThuongTruReal: (!isCheckAddressChip && checkDcThuongTru) ? 0 : 1,
            checkProvinceReal: (!isCheckAddressChip && checkProvinceThuongTru) ? 0 : 1,
            checkDistrictReal: (!isCheckAddressChip && checkDistrictThuongTru) ? 0 : 1,
            checkWardReal: (!isCheckAddressChip && checkWardThuongTru) ? 0 : 1,
        }
        const khachHang = {
            ...(getValues("cccdCu") && { cccdCu: getValues("cccdCu") }),
            ...((settingData?.ekycType == "MANUAL" && getValues("ngayHetHan")) && { ngayHetHan: getValues("ngayHetHan") })
        }
        const fileLoanApplication = newData?.fileLoanApplication?.map((item) => item.data)?.flat()?.map(item => ({ ...item, checkYeuCauChinhSua: 0 }))
        const fileListId = [...fileLoanApplication?.map(e => e.id), ...spouseFiles?.map(item => item?.id)];

        return { newData, spouse, salesContractInformation, checkAddress, khachHang, fileLoanApplication, fileListId, contractSpouse }
    }

    const returnData = (action) => {
        const { newData, spouse, salesContractInformation, checkAddress, khachHang, fileLoanApplication, fileListId, contractSpouse } = handleDataReturn();

        const mergeData = {
            ...settingData,
            ...newData,
            ...checkAddress,
            ...contractSpouse,
            khachHang,
            spouse,
            salesContractInformation,
            chiPhiSinhHoatHangThang: convertStringToInt(newData?.chiPhiSinhHoatHangThang),
            giaXe: newData.giaXe != null ? Ultis.tryParseFloat(`${newData.giaXe}`.replaceAll(",", "")) : null,
            giaPhuTung: newData.giaPhuTung != null ? Ultis.tryParseFloat(`${newData.giaPhuTung}`.replaceAll(",", "")) : null,
            tongGiaBan: Ultis.tryParseFloat(`${newData.tongGiaBan}`.replaceAll(",", "").replaceAll(" VND", "")),
            kyHanGiaiDoan1: newData.kyHanGiaiDoan1 != null ? Ultis.tryParseInt(`${newData.kyHanGiaiDoan1}`) : null,
            kyHanGiaiDoan2: newData.kyHanGiaiDoan2 != null ? Ultis.tryParseInt(`${newData.kyHanGiaiDoan2}`) : null,
            laiSuatGiaiDoan1: newData.laiSuatGiaiDoan1 != null ? Ultis.tryParseFloat(`${newData.laiSuatGiaiDoan1}`) : null,
            laiSuatGiaiDoan2: newData.laiSuatGiaiDoan2 != null ? Ultis.tryParseFloat(`${newData.laiSuatGiaiDoan2}`) : null,
            soTienThanhToanHangThangGd1: convertStringToInt(newData?.amountSuggestFirst),
            soTienThanhToanHangThangGd2: convertStringToInt(newData?.amountSuggestSecond),
            namCuTru: newData.namCuTru != null ? Ultis.tryParseInt(newData.namCuTru) : null,
            losProductGoods: newData.losProductGoods?.map((item) => ({
                ...item,
                unitPrice: item.unitPrice != null ? Ultis.tryParseFloat(`${item.unitPrice}`.replaceAll(",", "")) : null,
                quantity: item.quantity != null ? Ultis.tryParseFloat(`${item.quantity}`.replaceAll(",", "")) : null,
            })),
            maNhanHieu: Ultis.tryParseInt(newData.maNhanHieu),
            tongThanhToanNoVayHangThang: newData.tongThanhToanNoVayHangThang != null ? Ultis.tryParseFloat(`${newData.tongThanhToanNoVayHangThang}`.replaceAll(",", "")) : null,
            thuNhapKhac: newData.thuNhapKhac != null ? Ultis.tryParseFloat(`${newData.thuNhapKhac}`.replaceAll(",", "")) : null,
            thuNhapThang: newData.thuNhapThang != null ? Ultis.tryParseFloat(`${newData.thuNhapThang}`.replaceAll(",", "")) : null,
            soNguoiPhuThuoc: newData.soNguoiPhuThuoc != null ? Ultis.tryParseInt(`${newData.soNguoiPhuThuoc}`) : null,
            soTienTraTruoc: newData.soTienTraTruoc != null ? Ultis.tryParseInt(`${newData.soTienTraTruoc}`.replaceAll(",", "")) : null,
            soTienBaoHiem: newData.soTienBaoHiem != null ? Ultis.tryParseInt(`${newData.soTienBaoHiem}`.replaceAll(",", "")) : null,
            tongKhoanVay: newData.tongKhoanVay != null ? Ultis.tryParseInt(`${newData.tongKhoanVay}`.replaceAll(",", "")) : null,
            fileLoanApplication,
            fileListId: fileListId,
        }

        const sendData = {
            action: action,
            loanApplicationRequest: {
                "fis.onboarding.process.model.jlos.dto.LoanApplicationDTO": {
                    ...mergeData
                },
            }
        }

        return sendData;
    }

    const handleCancelForm = async () => {
        try {
            const resData = await checkLoanStatus(settingData?.id)
            if (resData?.code == 400) {
                dispatch({ type: SET_MESSAGE, title: resData?.message });
                navigate('/admin/ho-so-cho-xu-ly')
                return
            }
        } catch (error) {
        }
        const sendData = returnData("saleCancel");
        sendData.rejectReasonCode = lyDoTuChoi.code;
        try {
            let res = await hoSo_doneAction(taskID, "saleCancel", sendData);
            navigate('/admin/ho-so-cho-xu-ly')
            dispatch({ type: SUMMARIES, data: true });
            return res
        } catch (error) {
            // notify(notificationAlert, ERROR, error)
        }
    }

    const handleSendForm = async () => {
        try {
            const resData = await checkLoanStatus(settingData?.id)
            if (resData?.code == 400) {
                dispatch({ type: SET_MESSAGE, title: resData?.message });
                navigate('/admin/ho-so-cho-xu-ly')
                return
            }
        } catch (error) {
        }
        setSendLoading(true);
        const sendData = returnData("saleSend");
        try {
            if (!!responseCheckCicPcb?.responseCheckCicPcb?.data && responseCheckCicPcb?.responseCheckCicPcb?.data?.idPcbAsk != null) {
                const cicPcbResult = await getCheckHaveResultCicPcb(responseCheckCicPcb.responseCheckCicPcb.data.idPcbAsk);
                if (!cicPcbResult) {
                    setQuaThoiGianCic(true);
                    setSendLoading(false);
                    return;
                }
                if (!!responseCheckCicPcb?.responseCheckCicPcbSpouse?.data && responseCheckCicPcb?.responseCheckCicPcbSpouse?.data?.idPcbAsk != null) {
                    const cicPcbResultSpouse = await getCheckHaveResultCicPcb(responseCheckCicPcb.responseCheckCicPcbSpouse.data.idPcbAsk);
                    if (!cicPcbResultSpouse) {
                        setQuaThoiGianCic(true);
                        setSendLoading(false);
                        return;
                    }
                }
            }

            await hoSo_doneAction(taskID, "saleSend", sendData);
            const searchData = await getTaskDetail({ id: subId });
            setTaskID(searchData["active-user-tasks"]["task-summary"][0]["task-id"]); //Set lại task id
            setResponseCheckCicPcb(searchData["process-instance-variables"]);
            if (searchData["process-instance-state"] === 2) {
                navigate('/admin/ho-so-cho-xu-ly');
            } else if (searchData["process-instance-variables"].responseCheckCicPcb != null) {
                const responseCicPcb = searchData["process-instance-variables"].responseCheckCicPcb;
                if (responseCicPcb?.data?.status === "NOT_QUALIFIED") {
                    setKhongThoaManCic(true);
                    setSendLoading(false);
                    return;
                } else if (responseCicPcb?.data?.status === "ERROR") {
                    setQuaThoiGianCic(true);
                } else if (responseCicPcb?.data?.status !== "SUCCESS") {
                    dispatch({ type: SET_MESSAGE, title: i18("LOI_VUI_LONG_THU_LAI_SAU_IT_PHUT") });
                }
            }
            if (searchData["process-instance-variables"].responseCheckCicPcbSpouse != null) {
                const responseCicPcbSpouse = searchData["process-instance-variables"].responseCheckCicPcbSpouse;
                if (responseCicPcbSpouse?.data?.status === "NOT_QUALIFIED") {
                    setKhongThoaManCic(true);
                    setSendLoading(false);
                    return
                } else if (responseCicPcbSpouse?.data?.status === "ERROR") {
                    setQuaThoiGianCic(true);
                } else if (responseCicPcbSpouse?.data?.status !== "SUCCESS") {
                    dispatch({ type: SET_MESSAGE, title: i18("LOI_VUI_LONG_THU_LAI_SAU_IT_PHUT") });
                }
            }
            dispatch({ type: SUMMARIES, data: true });
            // setTaskID(searchData["active-user-tasks"]["task-summary"][0]["task-id"]);
        } catch (error) {
            const searchData = await getTaskDetail({ id: subId });
            if (!!searchData && searchData["active-user-tasks"] && searchData["active-user-tasks"]["task-summary"]) {
                setTaskID(searchData["active-user-tasks"]["task-summary"][0]["task-id"]);
                dispatch({ type: SET_MESSAGE, title: i18("DA_CO_LOI_XAY_RA") });
                setSendLoading(false);
            } else {
                navigate('/admin/ho-so-cho-xu-ly');
            }
        }
        setSendLoading(false);
    }

    const handleSaveForm = async () => {
        if (checkWorkTime()) return;
        const resData = await checkLoanStatus(settingData?.id)
        if (resData?.code == 400) {
            dispatch({ type: SET_MESSAGE, title: resData?.message });
            navigate('/admin/ho-so-cho-xu-ly')
            return
        }
        setsaveloading(true)
        const sendData = returnData("saleSave");
        try {
            await tinhKetQuaDTI(getValues(), false);
            let res = await hoSo_doneAction(taskID, "saleSave", sendData);
            navigate('/admin/ho-so-cho-xu-ly');
            return res;
        } catch (error) {
            setsaveloading(false);
        }
        setsaveloading(false);
    }

    useEffect(() => {
        initData();
        getDanhSachTrinhDoHocVan();
        getDanhSachTinhThanhPho();
        getDanhSachTinhTrangCuTru();
        getDanhSachQuanHe();
        getDanhSachNgheNghiep();
        getDanhSachChucVu();
        get_danhSachLyDoHuy();
    }, [setValue]);

    const InsuranceItem = ({ item, index }) => {
        return (
            <div
                key={`baoHiem_${item.id}_${index}`}
                className={`w-frame wbaseItem-value w-col 06a32bdd-a293-44ca-9d43-7e590197131f ${item.isRequired == 1 ? "required" : ""}`}

            >
                <div className="w-frame wbaseItem-value w-row 5862e631-3e75-42dd-ab3b-a60be9620d45">
                    <div className="w-text wbaseItem-value dd79fd22-1879-47d0-8c4a-1917e0dfc778">
                        {item.isRequired == 1 ?
                            i18("BAO_HIEM_DUA_TREN_KHA_NANG_TAI_CHINH_KHACH_HANG") :
                            i18("BAO_HIEM_TU_NGUYEN")
                        }
                    </div>
                    {item.isRequired != 1 &&
                        <button onClick={() => deleteInsurance(index)} type="button" className="w-button wbaseItem-value w-row dbf9aef3-44e1-4820-a6c7-b543b345e93b">
                            <div className="w-text wbaseItem-value 0392e20b-e79a-4d47-a172-6241ee934899">i18("XOA")</div>
                        </button>
                    }
                </div>
                <div className="w-frame wbaseItem-value w-row 848909fb-e3b2-4ee7-842f-364a8c7a5a85">
                    <div className="w-frame wbaseItem-value w-row 0cb3c276-30d1-46c3-a30a-cb9880cf697c" wrap="wrap">
                        <div style={{ order: 1 }} className="w-frame wbaseItem-value w-col col- col12-lg col12-md col8-xxl col12-xl 74b4e0e0-1aff-4ad2-b1f0-aff1c663f576">
                            <div className="w-frame wbaseItem-value w-row c1efbb00-c704-4ab7-b76d-d2df36b4ad2e">
                                <div className="w-text wbaseItem-value f1f5986d-6009-4c97-9719-66a26ff0de3a">{i18("NHA_CUNG_CAP")}</div>
                                <div className="w-text wbaseItem-value 83f39fbf-2557-4a4c-827c-35fa333a8ef0">*</div>
                            </div>
                            <Controller
                                name={`loanApplicationInsurance[${index}].maNhaCungCap`}
                                control={control}
                                {...register(`loanApplicationInsurance[${index}].maNhaCungCap`)}
                                style={{ order: 2 }} rules={{ required: i18("VUI_LONG_CHON_NHA_CUNG_CAP") }}
                                render={({ field }) => (
                                    <div
                                        className={`select2-custom ${errors?.loanApplicationInsurance?.[index]?.maNhaCungCap && 'helper-text'}`}
                                        helper-text={errors?.loanApplicationInsurance?.[index]?.maNhaCungCap && i18("VUI_LONG_CHON_NHA_CUNG_CAP")}
                                        placeholder={i18("CHON_NHA_CUNG_CAP")}
                                    >
                                        <Select2 {...field}
                                            data={(item.isRequired == true ? danhSachNhaCungCapBHBB : danhSachNhaCungCapBHTN).map((item, _) => ({ name: item.insuranceSupplierName, id: item.insuranceSupplier }))}
                                            options={{ placeholder: i18("CHON_NHA_CUNG_CAP") }}
                                            onChange={(ev) => {
                                                if (ev.target.value !== "" && ev.target.value != getValues(`loanApplicationInsurance[${index}].maNhaCungCap`)) {
                                                    Object.keys(watch("loanApplicationInsurance")[index]).forEach((key) => {
                                                        if (key != "isRequired" && key != "isNew" && key != "id") {
                                                            setValue(`loanApplicationInsurance[${index}].${key}`, null)
                                                        }
                                                    });
                                                    let selected = (item.isRequired == true ? danhSachNhaCungCapBHBB : danhSachNhaCungCapBHTN).find((e) => e.insuranceSupplier == ev.target.value);
                                                    setValue(`loanApplicationInsurance[${index}].maNhaCungCap`, ev.target.value)
                                                    setValue(`loanApplicationInsurance[${index}].nhaCungCap`, selected.insuranceSupplierName);
                                                    if (!item.isNew) {
                                                        setValue(`loanApplicationInsurance[${index}].action`, "edit");
                                                    }
                                                    const newList = [...watch("loanApplicationInsurance")];
                                                    newList[index].maNhaCungCap = ev.target.value;
                                                    newList[index].nhaCungCap = selected.insuranceSupplierName;
                                                    setValue('loanApplicationInsurance', newList);
                                                    clearErrors(`loanApplicationInsurance[${index}].maNhaCungCap`)
                                                    calculate_feeInsurance(watch("loanApplicationInsurance"));
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            />
                        </div>
                        <div style={{ order: 2 }} className="w-frame wbaseItem-value w-col col- col12-lg col12-md col8-xxl col12-xl 36e8daf0-a595-42dd-b3db-c81f012d08b8">
                            <div className="w-frame wbaseItem-value w-row ec3f9caf-70b7-4e01-85fa-ca22d552f16f">
                                <div className="w-text wbaseItem-value 3a3677ce-ca31-4b75-a1c4-b8b8a3ec8d29">{i18("TEN_GOI_BAO_HIEM")}</div>
                                <div className="w-text wbaseItem-value d784c4fb-63c9-446a-8b98-f33db26e8d76">*</div>
                            </div>
                            <Controller
                                name={`loanApplicationInsurance[${index}].maBaoHiem`}
                                control={control}
                                {...register(`loanApplicationInsurance[${index}].maBaoHiem`)}
                                style={{ order: 2 }} rules={{ required: i18("VUI_LONG_CHON_NHA_CUNG_CAP") }}
                                render={({ field }) => (
                                    <div
                                        className={`select2-custom ${errors?.loanApplicationInsurance?.[index]?.maBaoHiem && 'helper-text'}`}
                                        helper-text={errors?.loanApplicationInsurance?.[index]?.maBaoHiem && "Vui lòng chọn tên gói bảo hiểm"}
                                        placeholder={i18("CHON_TEN_GOI_BAO_HIEM")}
                                    >
                                        <Select2 {...field}
                                            data={(item.isRequired == true ? selected_loanProgram.insuranceDetails : selected_loanProgram.insuranceVoluntaryDetails).filter((e) => e.insuranceSupplier == item.maNhaCungCap).map(el => ({ name: el.insuranceName, id: el.insuranceCode })).filter((el) => !watch("loanApplicationInsurance").some((e) => e.maBaoHiem === el.id) || el.id == item.maBaoHiem)}
                                            options={{ placeholder: i18("CHON_TEN_GOI_BAO_HIEM") }}
                                            onChange={(ev) => {
                                                if (ev.target.value !== "" && ev.target.value != getValues(`loanApplicationInsurance[${index}].maBaoHiem`)) {
                                                    Object.keys(watch("loanApplicationInsurance")[index]).forEach((key) => {
                                                        if (key !== "isRequired" && key !== "maNhaCungCap" && key !== "nhaCungCap" && key !== "isNew" && key !== "id") {
                                                            setValue(`loanApplicationInsurance[${index}].${key}`, null)
                                                        }
                                                    });
                                                    let selected = (item.isRequired == true ? selected_loanProgram.insuranceDetails : selected_loanProgram.insuranceVoluntaryDetails).find((e) => e.insuranceCode == ev.target.value);
                                                    let _phiBaoHiem = selected.chargedType === BaoHiemDA.TY_LE_PHI_CODE ? parseFloat(`${watch("tongKhoanVay")}`) * selected.feeInsuranceRate / 100 * parseInt(watch("kyHanVay")) : selected.feeInsurance;
                                                    setValue(`loanApplicationInsurance[${index}].maBaoHiem`, ev.target.value);
                                                    setValue(`loanApplicationInsurance[${index}].tenBaoHiem`, selected?.insuranceName);
                                                    setValue(`loanApplicationInsurance[${index}].chuKyBaoHiem`, selected?.insurancePeriodName);
                                                    setValue(`loanApplicationInsurance[${index}].maChuKyBaoHiem`, selected?.insurancePeriod);
                                                    setValue(`loanApplicationInsurance[${index}].tyLeSoTienDuocBaoHiem`, selected?.rateCovered ?? 100);
                                                    setValue(`loanApplicationInsurance[${index}].soTienBaoHiem`, Ultis.tryParseFloat((watch("soTienVayGoc") * selected?.rateCovered / 100).toFixed(0)));
                                                    setValue(`loanApplicationInsurance[${index}].phiBaoHiem`, _phiBaoHiem);
                                                    setValue(`loanApplicationInsurance[${index}].tyLeBaoHiem`, selected?.feeInsuranceRate);
                                                    setValue(`loanApplicationInsurance[${index}].maLoaiTinhPhi`, selected?.chargedType);
                                                    setValue(`loanApplicationInsurance[${index}].loaiTinhPhi`, selected?.chargedTypeName);
                                                    setValue(`loanApplicationInsurance[${index}].flexcubeCode`, selected?.flexcubeCode);
                                                    setValue(`loanApplicationInsurance[${index}].maLoaiBaoHiem`, selected?.insuranceDocTypeCode); //Loại và tên bảo hiểm
                                                    setValue(`loanApplicationInsurance[${index}].loaiBaoHiem`, selected?.insuranceDocTypeName);
                                                    if (!item.isNew) {
                                                        setValue(`loanApplicationInsurance[${index}].action`, "edit");
                                                    }
                                                    const newList = [...watch("loanApplicationInsurance")];
                                                    newList[index].maBaoHiem = ev.target.value;
                                                    newList[index].tenBaoHiem = selected.insuranceName;
                                                    setValue('loanApplicationInsurance', newList);
                                                    clearErrors(`loanApplicationInsurance[${index}].maBaoHiem`)
                                                    calculate_feeInsurance(watch("loanApplicationInsurance"));
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            />
                        </div>
                        <div style={{ order: 3 }} className="w-frame wbaseItem-value w-col col- col12-lg col12-md col8-xxl col12-xl 7ae3ba16-05e0-462c-b75e-08fbf7ec67c3">
                            <div className="w-frame wbaseItem-value w-row 28ff5be1-a672-44ff-b34e-efdb496bbca5">
                                <div className="w-text wbaseItem-value f5745ec9-1ea5-45c0-b600-a9562cc8ea96">{i18("HINH_THUC_THANH_TOAN")}</div>
                                <div className="w-text wbaseItem-value d784c4fb-63c9-446a-8b98-f33db26e8d76">*</div>
                            </div>
                            <Controller
                                name={`loanApplicationInsurance[${index}].maHinhThucThanhToan`}
                                control={control}
                                {...register(`loanApplicationInsurance[${index}].maHinhThucThanhToan`)}
                                style={{ order: 2 }} rules={{ required: i18("VUI_LONG_CHON_HINH_THUC_THANH_TOAN") }}
                                render={({ field }) => (
                                    <div
                                        className={`select2-custom ${errors?.loanApplicationInsurance?.[index]?.maHinhThucThanhToan && 'helper-text'}`}
                                        helper-text={errors?.loanApplicationInsurance?.[index]?.maHinhThucThanhToan && i18("VUI_LONG_CHON_HINH_THUC_THANH_TOAN")}
                                        placeholder={i18("CHON_HINH_THUC_THANH_TOAN")}
                                    >
                                        <Select2 {...field}
                                            data={(item.isRequired == true ? selected_loanProgram.insuranceDetails : selected_loanProgram.insuranceVoluntaryDetails)?.find((e) => e.insuranceSupplier == item.maNhaCungCap && e.insuranceCode == item.maBaoHiem)?.paymentTypes?.map(el => ({ name: el.losInsurancePaymentTypeName, id: el.losInsurancePaymentTypeCode })) ?? []}
                                            options={{ placeholder: i18("CHON_HINH_THUC_THANH_TOAN") }}
                                            disabled={watch("kyHanVay") == null}
                                            onChange={(ev) => {
                                                if (ev.target.value !== "" && ev.target.value != getValues(`loanApplicationInsurance[${index}].maHinhThucThanhToan`)) {
                                                    const selected = (item.isRequired == true ? selected_loanProgram.insuranceDetails : selected_loanProgram.insuranceVoluntaryDetails).find((e) => e.insuranceSupplier == item.maNhaCungCap && e.insuranceCode == item.maBaoHiem).paymentTypes.find((e) => e.losInsurancePaymentTypeCode == ev.target.value);
                                                    setValue(`loanApplicationInsurance[${index}].maHinhThucThanhToan`, ev.target.value)
                                                    setValue(`loanApplicationInsurance[${index}].hinhThucThanhToan`, selected.losInsurancePaymentTypeName);
                                                    if (!item.isNew) {
                                                        setValue(`loanApplicationInsurance[${index}].action`, "edit");
                                                    }
                                                    clearErrors(`loanApplicationInsurance[${index}].maHinhThucThanhToan`);
                                                    calculate_feeInsurance(watch("loanApplicationInsurance"));
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            />
                        </div>
                        <div style={{ order: 4 }} className="w-frame wbaseItem-value w-col col- col12-lg col12-md col8-xxl col12-xl 37dfc4d3-59a4-4445-81d3-fb3ae36fe894">
                            <div className="w-frame wbaseItem-value w-row 2567b3a7-071e-49cf-9ff3-bd1405abc723">
                                <div className="w-text wbaseItem-value a471dc12-607d-4003-b134-4fc5bd14428b">i18("CHU_KY_BAO_HIEM"):</div>
                            </div>
                            <div style={{ padding: "0 8px", height: 38 }} className="w-textformfield wbaseItem-value w-row c2420bb7-c9ee-4c3f-8ef4-372474f37b72" placeholder>
                                <div className="wbaseItem-value 75d2002e-a2aa-4d24-b082-6d308a100a7e" cateid={86}>
                                    <div className="textfield">
                                        <input
                                            value={item.chuKyBaoHiem ?? ""}
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="w-frame wbaseItem-value w-col col- col12-lg col12-md col8-xxl col12-xl 46ad985c-9abe-4ce3-a213-ac2affc17eab">
                            <div className="w-frame wbaseItem-value w-row e2f1d6b7-077b-4905-b5cd-6eae8e0d6cd2">
                                <div className="w-text wbaseItem-value 5e3c0ffd-7e39-47c1-b8c8-c04ca7b8f865">i18("TY_LE_PHI_BAO_HIEM_THEO_THANG"):</div>
                            </div>
                            <div style={{ padding: "0 8px", height: 38 }} className="w-textformfield wbaseItem-value w-row 6a407d3d-95f9-43e4-8e2f-cad78b062cbd" placeholder>
                                <div className="wbaseItem-value 8edd41c5-ad2e-4b9a-96d7-bb00f863768f" cateid={86}>
                                    <div className="textfield">
                                        <input
                                            value={`${item.tyLeBaoHiem ? (item.tyLeBaoHiem + " %") : ""}`}
                                            name="Textformfield"
                                            disabled
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>
                    <div className="w-frame wbaseItem-value w-col 201bd275-94ab-423f-9636-34ae1082f32b">
                        <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col12-md col12-sm col12 48533ad5-316a-41e1-9bcc-df82660b6016">
                            <div className="w-text wbaseItem-value 455fd82b-9ca3-4399-ac56-e1bb0c8e589c">Phí bảo hiểm tạm tính (VND):</div>
                            <div className="w-text wbaseItem-value 4bc34ff8-db55-41cd-8fdd-e5ad4b8bd9f6">
                                {Ultis.money(item.phiBaoHiem, 0)}
                            </div>
                        </div>
                        <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col12-md col12-sm col12 ccc05954-4253-4363-906e-9419ea6a9b82">
                            <div className="w-text wbaseItem-value 4a123917-1a2b-4bf0-8d84-489ad876952b">Số tiền bảo hiểm tạm tính (VND):</div>
                            <div className="w-text wbaseItem-value 3231aa7e-30ef-48ae-9262-31cd706987dd">
                                {Ultis.money(item.soTienBaoHiem, 0)}
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        )
    }

    const GiaDinhKeQuaDTI = () => {
        return ReactDOM.createPortal(
            <PopupDeXuatKhoanVay
                closePopup={() => setDeXuatKhoangVay(false)}
                settingData={getValues()}
                loanProgram={selected_loanProgram}
                onConfirm={(dataDTI) => {
                    Object.keys(dataDTI).forEach(fieldName => {
                        setValue(fieldName, dataDTI[fieldName]);
                    });
                    calculate_feeInsurance(watch("loanApplicationInsurance"));
                    setDeXuatKhoangVay(false);
                }}
                isHaveSpouse={isHaveSpouse}
            />
            , document.body
        )
    }

    const focus_duNo = () => {
        setPopupDuNo(false);
        setError("soTienTraTruoc", { message: `Tổng số tiền vay và dư nợ hiện tại của khách hàng không vượt quá ${checkTotalLoan ? Ultis.money(checkTotalLoan) : '100,000,000'} VND` });
    }

    const [lyDoTuChoi, setLyDoTuChoi] = useState({
        name: "",
        code: ""
    });

    const [showErrorTuChoi, setShowErrorTuChoi] = useState(false);

    const DropDownLyHoHuy = () => {
        return (
            <div className={`select-rr-box ${showErrorTuChoi ? "validate" : ""}`} style={{ margin: "12px 0", width: "100%" }}>
                <Select2
                    name=""
                    data={listRejectReson.map((item, _) => { return { id: item.code, name: item.name } })}
                    defaultValue={lyDoTuChoi.code}
                    options={{
                        placeholder: i18("CHON_LY_DO_TU_CHOI"),
                    }}
                    onChange={(ev) => {
                        if (ev.target.value !== "") {
                            let _tmp = {
                                name: listRejectReson.find((e) => e.code == ev.target.value).name,
                                code: ev.target.value
                            }
                            setLyDoTuChoi(_tmp)
                        }
                    }}
                />
                {
                    showErrorTuChoi && <div style={{ fontSize: 12, marginTop: 4, color: "red" }}>i18("VUI_LONG_CHON_LY_DO_TU_CHOI")</div>
                }
            </div>
        )
    }

    useEffect(() => {
        dispatch(getMyWorkTime())
    }, []);

    useEffect(() => {
        if (workTimeStore?.isRestrict) {
            setIsExitTime(true)
            return;
        }
    }, [workTimeStore]);

    const checkWorkTime = () => {
        dispatch(getMyWorkTime()).then((res) => {
            if (res?.data?.isRestrict) {
                setIsExitTime(true);
                return true;
            }
            else return false;
        })
    }

    useEffect(() => {
        const interval = setInterval(() => {
            const dateCurrent = format(new Date(), 'MM/dd/yyyy');
            if (!!workTimeStore?.endTime && !!workTimeStore?.startTime) {
                if (Date.parse(`${dateCurrent} ${workTimeStore?.startTime}`) > new Date().getTime() || new Date().getTime() > Date.parse(`${dateCurrent} ${workTimeStore?.endTime}`)) {
                    setIsExitTime(true)
                }
            }
        }, POOLING_TIME_DEFAULT);
        return () => {
            clearInterval(interval);
        };
    }, [POOLING_TIME_DEFAULT, workTimeStore])

    const RenDerPronvinces = () => {
        return (
            <SelectField
                control={control}
                keyName="provinceCodeTemp"
                placeholder={!isCheckAddressChip && i18("CHON_TINH_THANH")}
                title=i18("TINH_THANH_PHO")
        options = { danhSachTinhThanhPho.map((item) => { return { id: item?.code, name: item?.fullName } }) }
        style = {{ order: 2 }
    }
    required = { isCheckAddressChip? false: true }
    errors = { errors }
    disabled = { isCheckAddressChip }
    onChangeSelect = { async(event) => {
        const selectedProvince = event.target.selectedOptions[0];
        if (selectedProvince) {
            setDistrictTempName('');
            setWardTempName('');
            setValue("wardCodeTemp", null);
            setValue("districtCodeTemp", null);
            setPhuongXaThuongTru([]);
            setQuanHuyenThuongTru([]);
            await getDanhSachQuanHuyenThuongTru(selectedProvince?.value);
            setValue("addressProvincesName", selectedProvince?.label);
            setProvinceTempName(selectedProvince?.label);
            if (watch("isTamTruGiongThuongTru")) {
                setValue("currentAddressProvincesName", selectedProvince?.label);
                setValue("currentAddressProvincesCode", selectedProvince?.value);
            }
        }
        if (settingData?.provinceCodeTemp != selectedProvince?.value) {
            setCheckProvinceThuongTru(1);
        }
    }
}
isFirst = { isCheckAddressChip }
nameFirst = { watch("addressProvincesName") }
    />
        );
    };

const RenDerDistricts = () => {
    return (
        <SelectField
            control={control}
            keyName="districtCodeTemp"
            placeholder={!isCheckAddressChip && "Chọn quận / huyện"}
            title="Quận/Huyện"
            options={danhSachQuanHuyenThuongTru.map((item) => ({ id: item.code, name: item.fullName }))}
            style={{ order: 3 }}
            required={isCheckAddressChip ? false : true}
            disabled={isCheckAddressChip}
            errors={errors}
            onChangeSelect={async (event) => {
                const selectedDistrict = event.target.selectedOptions[0];
                if (selectedDistrict) {
                    setPhuongXaThuongTru([]);
                    await getDanhSachPhuongXaThuongTru(selectedDistrict.value);
                    setValue("addressDistrictName", selectedDistrict?.label);
                    setWardTempName('');
                    clearErrors("districtCodeTemp");
                    clearErrors("wardCodeTemp");
                    if (watch("isTamTruGiongThuongTru")) {
                        setDistrictTempName(selectedDistrict?.label);
                        setValue("currentAddressDistrictName", selectedDistrict?.label);
                        setValue("currentAddressDistrictCode", selectedDistrict.value);
                        tinhKetQuaDTI(getValues(), false);
                    }
                }
                if (settingData?.addressDistrictCode != selectedDistrict.value) {
                    setCheckDistrictThuongTru(1);
                }
            }}
            isFirst={isCheckAddressChip}
            nameFirst={watch("addressDistrictName")}
        />
    );
};

const RenderWards = () => {
    return (
        <SelectField
            control={control}
            keyName="wardCodeTemp"
            placeholder={!isCheckAddressChip && i18("CHON_PHUONG_XA")}
            disabled={isCheckAddressChip}
            title=i18("PHUONG_XA")
    options = { danhSachPhuongXaThuongTru.map((item) => ({ id: item.code, name: item.fullName })) }
    style = {{ order: 4 }
}
required = { isCheckAddressChip? false: true }
errors = { errors }
onChangeSelect = { async(event) => {
    const selectedWard = event.target.selectedOptions[0];
    if (selectedWard) {
        setValue("addressWardsName", selectedWard?.label);
        if (watch("isTamTruGiongThuongTru")) {
            setWardTempName(selectedWard?.label);
            setValue("currentAddressWardsName", selectedWard?.label);
            setValue("currentAddressWardsCode", selectedWard.value);
        }
    }
    if (settingData?.addressWardsCode != selectedWard.value) {
        setCheckWardThuongTru(1);
    }
}}
isFirst = { isCheckAddressChip }
nameFirst = { watch("addressWardsName") }
    />
        );
    };

const onChangeCheckAddressChip = async () => {
    setIsLoadingAddress(true);
    const danhSachQuanHuyen = await getDanhSachQuanHuyenThuongTru(customerItem?.addressProvincesCode);
    const danhSachPhuongXa = await getDanhSachPhuongXaThuongTru(customerItem?.addressDistrictCode);
    setIsCheckAddressChip(prevStatus => {
        const statusCheck = !prevStatus;
        setValue('isTamTruGiongThuongTru', false);
        setValue("dcTamTru", null);
        setValue("currentAddressProvincesName", null);
        setValue("currentAddressDistrictName", null);
        setValue("currentAddressWardsName", null);
        setValue("currentAddressProvincesCode", null);
        setValue("currentAddressDistrictCode", null);
        setValue("currentAddressWardsCode", null);
        setCheckDcThuongTru(0);
        setCheckProvinceThuongTru(0);
        setCheckDistrictThuongTru(0);
        setCheckWardThuongTru(0);
        if (statusCheck) {
            setValue("dcThuongTru", customerItem?.addressDetail);
            setValue("provinceCodeTemp", customerItem?.addressProvincesCode);
            setValue("districtCodeTemp", customerItem?.addressDistrictCode);
            setValue("wardCodeTemp", customerItem?.addressWardsCode);
            const province = danhSachTinhThanhPho.find(item => item.code == customerItem?.addressProvincesCode);
            const district = danhSachQuanHuyen.find(item => item.code == customerItem?.addressDistrictCode);
            const ward = danhSachPhuongXa.find(item => item.code == customerItem?.addressWardsCode);
            setValue("addressProvincesName", province?.fullName);
            setValue("addressDistrictName", district?.fullName);
            setValue("addressWardsName", ward?.fullName);
            clearErrors("provinceCodeTemp");
            clearErrors("districtCodeTemp");
            clearErrors("wardCodeTemp");
        } else {
            tinhKetQuaDTI(getValues(), false);
        }

        return statusCheck;
    });
    setIsLoadingAddress(false);
}

useEffect(() => {
    let tyLeTraTruoc = Ultis.tryParseFloat(getValues("tyLeTraTruoc"));
    let tongGiaBan = Ultis.tryParseFloat(getValues("tongGiaBan"));
    let soTienTraTruoc = Ultis.tryParseFloat(getValues("soTienTraTruoc"));
    let soTienBaoHiem = Ultis.tryParseFloat(getValues("soTienBaoHiem"));
    let soTienVayGoc = Ultis.tryParseFloat(getValues("soTienVayGoc"));
    let tongKhoanVay = Ultis.tryParseFloat(getValues("tongKhoanVay"));

    if (tyLeTraTruoc != 0 && tongGiaBan != 0) {
        soTienTraTruoc = Ultis.tryParseFloat(`${(tongGiaBan * tyLeTraTruoc / 100)}`);
    } else if (soTienTraTruoc != 0 && tongGiaBan != 0) {
        tyLeTraTruoc = Ultis.tryParseFloat(`${(soTienTraTruoc / tongGiaBan * 100)}`);
    } else {
        tyLeTraTruoc = 0;
        soTienTraTruoc = 0;
    }

    soTienVayGoc = tongGiaBan - soTienTraTruoc;
    tongKhoanVay = soTienVayGoc + soTienBaoHiem;

    if (Object.keys(selected_loanProgram).length !== 0 && Ultis.tryParseFloat(`${tongGiaBan} `) > 0) {
        if (tyLeTraTruoc < selected_loanProgram?.data?.minimumPrepaymentPercent) {
            setError("tyLeTraTruoc", { message: `i18("TY_LE_TRA_TRUOC") tối thiểu cho chương trình vay là ${selected_loanProgram?.data?.minimumPrepaymentPercent}%.` });
        } else if (tyLeTraTruoc > selected_loanProgram?.data?.maximumPrepaymentPercent) {
            setError("tyLeTraTruoc", { message: `i18("TY_LE_TRA_TRUOC") tối đa cho chương trình vay là ${selected_loanProgram?.data?.maximumPrepaymentPercent}%.` });
        } else {
            clearErrors("tyLeTraTruoc");
        }

        if (soTienTraTruoc != null && soTienTraTruoc != "") {
            clearErrors("soTienTraTruoc");
        }

        if (soTienVayGoc < selected_loanProgram.data.minimumLoanAmount) {
            setError("soTienVayGoc", { message: `i18("SO_TIEN_VAY_GOC") tối thiểu của chương trình vay là: ${Ultis.money(selected_loanProgram.data.minimumLoanAmount)} VND` })
        } else if (soTienVayGoc > selected_loanProgram.data.maximumLoanAmount) {
            setError("soTienVayGoc", { message: `i18("SO_TIEN_VAY_GOC") tối đa của chương trình vay là: ${Ultis.money(selected_loanProgram.data.maximumLoanAmount)} VND` })
        } else {
            clearErrors("soTienVayGoc");
        }
    } else {
        clearErrors("tyLeTraTruoc");
        clearErrors("soTienTraTruoc");
        clearErrors("soTienVayGoc");
    }
    setValue("tyLeTraTruoc", tyLeTraTruoc);
    setValue("tongGiaBan", tongGiaBan != 0 ? tongGiaBan : null);
    setValue("soTienTraTruoc", soTienTraTruoc);
    setValue("soTienVayGoc", soTienVayGoc != 0 ? soTienVayGoc : null);
    setValue("tongKhoanVay", tongKhoanVay != 0 ? tongKhoanVay.toFixed(0) : null);
    calculate_feeInsurance(watch("loanApplicationInsurance"));
    tinhKetQuaDTI(getValues(), false);
}, [watch('tongGiaBan')]);

const checkAgeLoan = async (kyHanVay) => {
    const loanProgram = watch("maChuongTrinhVay");
    const response = await checkAgeLoanDA(loanProgram, customerAge, kyHanVay);
    return response;
}

const getListPayment2 = async () => {
    const facilityCode = watch("promotionCode");
    const appliedAmount = convertStringToInt(watch("tongKhoanVay"));
    const tenor = watch("kyHanVay");
    const interest = watch("laiSuatGiaiDoan1");
    const paymentDay = watch("ngayThanhToanHangThang");
    const settlementDate = watch("t2FlexCube");
    const product = selected_loanProgram?.data?.productChildrenCode;

    if (facilityCode &&
        appliedAmount &&
        settlementDate &&
        tenor &&
        interest >= 0 &&
        paymentDay &&
        product
    ) {
        const data = {
            product,
            appliedAmount,
            currency: "VND",
            settlementDate,
            tenor,
            interest,
            paymentDay,
            facilityCode
        }
        const response = await getSuggestedMonthlyPayment(data);
        if (response?.code == 200) {
            setValue("amountSuggestFirst", response?.data?.amountSuggestFirst);
            setValue("amountSuggestSecond", response?.data?.amountSuggestSecond);
        }
    }
}

useEffect(() => {
    getListPayment2();
}, [watch("promotionCode"), watch("t2FlexCube"), watch("tongKhoanVay"), watch("kyHanVay"), watch("laiSuatGiaiDoan1"), watch("ngayThanhToanHangThang"), selected_loanProgram])

useEffect(() => {
    if (watch("ngayHopDongDuKien")) {
        const checkHd = checkNgayKyHd(watch("ngayHopDongDuKien") || settingData?.ngayHopDongDuKien) ? 1 : 0;
        setCheckNgayKiHDEdit(checkHd);
    }
}, [settingData?.ngayHopDongDuKien, watch("ngayHopDongDuKien")])

return (
    data != null ?
        <>
            {isLoading && <Loader />}
            {isExitTime && <WPopup
                type={PopupType.WARNING}
                title=i18("THOI_GIAN_LAM_VIEC_DA_HET")
            confirmTitle='Xác nhận'
            confirmAction={() => {
                setIsExitTime(false);
                dispatch({ type: 'WORK_TIME', data: {} });
                navigate('/admin/ho-so-cho-xu-ly');
            }}
            cancelAction={() => {
                setIsExitTime(false);
                dispatch({ type: 'WORK_TIME', data: {} });
                navigate('/admin/ho-so-cho-xu-ly');
            }}
            cancelButton={false}
            cancelTitle=''
            message={`Đã hết giờ làm việc, vui lòng thực hiện thao tác trong khoảng thời gian từ ${workTimeStore.startTime} đến ${workTimeStore.endTime}`}
                />
                }
            {showPopupDC &&
                <WPopup
                    type={PopupType.WARNING}
                    title={i18("THONG_BAO")}
                    message=
                    {
                        <span style={{ textAlign: "center", lineHeight: 1.5 }}>
                            "i18("DIA_CHI_THUONG_TRU_KHONG_DAY_DU_DU_LIEU_VUI_LONG_NHAP_THONG_TIN_DIA_CHI_HIEN_TAI")."
                        </span>
                    }
                    confirmTitle='Xác nhận'
                    cancelAction={() => setShowPopupDC(false)}
                    confirmAction={() => setShowPopupDC(false)}
                    cancelButton={false}
                    confirmButton={true}
                />
            }
            {!isPassDTI &&
                <WPopup
                    type={PopupType.WARNING}
                    title={i18("THONG_BAO")}
                    message=
                    {
                        <span style={{ textAlign: "center", lineHeight: 1.5 }}>
                            {"i18("DIEM_DTI_KHONG_DAT_VUI_LONG_DIEU_CHINH_KHOAN_VAY_HOAC_KY_HAN_PHU_HOP")."}
                        </span>
                    }
                    confirmTitle='Xác nhận'
                    cancelAction={() => setPassDTI(true)}
                    confirmAction={() => setPassDTI(true)}
                    cancelButton={false}
                    confirmButton={true}
                />
            }
            {thoatKhoiTao &&
                <WPopup
                    type={PopupType.WARNING}
                    title={i18("HUY_BO_SUNG_HO_SO")}
                    message=i18("CAC_THONG_TIN_DA_NHAP_SE_KHONG_DUOC_LUU_LAI")
            cancelTitle=i18("TIEP_TUC_NHAP")
            confirmTitle='Xác nhận'
            cancelAction={() => setThoatKhoiTao(false)}
            confirmAction={() => { navigate('/admin/ho-so-cho-xu-ly') }}
            cancelButton={true}
                    />
                }
            {cicPcb_khongThoaMan != null &&
                <WPopup
                    type={PopupType.WARNING}
                    title={i18("THONG_BAO")}
                    message={
                        <span style={{ textAlign: "center", lineHeight: 1.5 }}>
                            {"i18("HIEN_TAI_QUY_KHACH_CHUA_DU_DIEU_KIEN_VAY_TAI_JIVF_CAM_ON_QUY_KHACH_DA_QUAN_TAM_DEN_DICH_VU_CUA_CHUNG_TOI")."}
                        </span>
                    }
                    confirmTitle='Xác nhận'
                    cancelAction={() => setKhongThoaManCic(null)}
                    confirmAction={async () => {
                        try {
                            const resData = await checkLoanStatus(settingData?.id)
                            if (resData?.code == 400) {
                                dispatch({ type: SET_MESSAGE, title: resData?.message });
                                navigate('/admin/ho-so-cho-xu-ly')
                                return
                            }
                        } catch (error) {
                        }
                        await hoSo_doneAction(taskID, "saleSend", {});
                        navigate('/admin/ho-so-cho-xu-ly');
                    }}
                    cancelButton={false}
                    confirmButton={true}
                />
            }
            {cicPcb_quaThoiGian != null &&
                <WPopup
                    type={PopupType.WARNING}
                    title={i18("THONG_BAO")}
                    message={
                        <span style={{ textAlign: "center", lineHeight: 1.5 }}>
                            {i18("PCB_CIC_KHONG_CO_PHAN_HOI_VUI_LONG_GUI_LAI_HO_SO_DE_TRA_CUU_LAI_HOAC_THOAT")}
                        </span>
                    }
                    confirmTitle='Xác nhận'
                    cancelAction={() => setQuaThoiGianCic(null)}
                    confirmAction={() => {
                        setQuaThoiGianCic(null);
                    }}
                    cancelButton={false}
                    confirmButton={true}
                />
            }
            {showPopupDuNo &&
                <WPopup
                    type={PopupType.WARNING}
                    title={i18("THONG_BAO")}
                    message={
                        <span style={{ textAlign: "center", lineHeight: 1.5 }}>
                            {`i18("TONG_KHOAN_VAY") đề xuất và Dư nợ tín chấp hiện tại của khách hàng không được vượt quá ${checkTotalLoan ? Ultis.money(checkTotalLoan) : '100,000,000'} VND. Vui lòng điều chỉnh i18("SO_TIEN_TRA_TRUOC") hoặc hướng dẫn khách hàng thanh toán i18("KHOAN_VAY_CU")`}
                        </span>
                    }
                    confirmTitle='Xác nhận'
                    cancelAction={() => setPopupDuNo(false)}
                    confirmAction={focus_duNo}
                    cancelButton={false}
                    confirmButton={true}
                />
            }
            {isKichThuocFile &&
                <WPopup
                    type={PopupType.WARNING}
                    title={i18("TEP_TAI_LEN_QUA_LON")}
                    message={<><span>i18("DUNG_LUONG_TOI_DA_CHO_PHEP_5MB").</span><span>i18("VUI_LONG_KIEM_TRA_LAI").</span></>}
                    cancelTitle="Đóng"
                    cancelAction={() => setKichThuocFile(false)}
                    cancelButton={true}
                    confirmButton={false}
                />
            }
            {isDinhDangFile &&
                <WPopup
                    type={PopupType.WARNING}
                    title={"Tệp tải lên chưa đúng định dạng"}
                    message={<><span>i18("DINH_DANG_FILE_CHO_PHEP")</span> <span>.doc, .docx, .xlsx, .jpg, .jpeg, .png, .pdf. </span><span>i18("VUI_LONG_KIEM_TRA_LAI").</span></>}
                    cancelTitle="Đóng"
                    cancelAction={() => setDinhDangFile(false)}
                    cancelButton={true}
                    confirmButton={false}
                />
            }
            {huyKhoiTao &&
                <WPopup
                    type={PopupType.ERROR}
                    title={i18("HUY_HO_SO")}
                    message={
                        DropDownLyHoHuy()
                    }
                    cancelTitle=i18("TIEP_TUC_NHAP")
            confirmTitle='Xác nhận'
            cancelAction={() => {
                setHuyKhoiTao(false);
                setLyDoTuChoi({})
                setShowErrorTuChoi(false)
            }}
            confirmAction={async () => {
                if (lyDoTuChoi?.code != null && lyDoTuChoi?.code !== "") {
                    await handleCancelForm()
                    navigate('/admin/ho-so-cho-xu-ly')
                } else {
                    setShowErrorTuChoi(true)
                }
            }}
            cancelButton={true}
                    />
                }
            {popupTuanThu &&
                <WPopup
                    type={PopupType.SUCCESS}
                    title={i18("THONG_BAO")}
                    message={
                        <span style={{ textAlign: "center", lineHeight: 1.5 }}>{i18("NHAN_VIEN_TU_VAN_XAC_NHAN_DA_KIEM_TRA_VA_CHIU_TRACH_NHIEM_VE_TINH_CHINH_XAC_CUA_CAC_THONG_TIN_KHACH_HANG_CUNG_CAP_DONG_THOI_TUAN_THU_NOI_DUNG_VE_CAC_HANH_VI_BI_CAM_VA_CAC_LUU_Y_BAT_BUOC_TUAN_THU_KHI_THUC_HIEN_CONG_VIEC_CUA_JIVF_")}</span>
                    }
                    cancelTitle=i18("QUAY_LAI")
            confirmTitle=i18("XAC_NHAN")
            cancelAction={() => {
                setPopupTuanThu(false);
            }}
            confirmAction={async () => {
                await tinhKetQuaDTI(getValues(), false);
                handleSendForm();
                setPopupTuanThu(false);
            }}
            cancelButton={true}
                    />
                }
            {showProcess &&
                <WPopup
                    popupContent={
                        <PopupXemQuyTrinh
                            closePopup={() => onShowProcess(false)}
                            code={settingData?.processInstanceId}
                            loanApplicationId={loanApplicaionId}
                        />
                    }
                />
            }
            {deXuatKhoangVay && <GiaDinhKeQuaDTI />}
            {popupCreateAccount &&
                <WPopup
                    popupContent={
                        <PopupCreateAccount
                            defaultName={userGenerate}
                            notificationAlert={notificationAlert}
                            onSubmitForm={() => {
                                if (getValues("ketQuaDTI") != "Đạt") {
                                    setPassDTI(false);
                                }
                                else {
                                    setPopupTuanThu(true);
                                }
                            }}
                            closePopup={() => {
                                setPopupCreateAccount(false);
                            }}
                        />
                    }
                />
            }
            <form
                onSubmit={handleSubmit(onSubmit, onError)}
                autoComplete='off' className="w-frame w-form wbaseItem-value w-col fdb8e196-6359-44ef-bc42-d12fe07b14fe">
                <NotificationAlert ref={notificationAlert} />
                <div className="w-frame wbaseItem-value w-col a76f8f80-ab4f-443b-977c-4cf99ed1ff74">
                    <div className="w-frame wbaseItem-value w-row f7afd45b-8834-4960-acc9-6edc88da3ed8">
                        <div className="w-frame wbaseItem-value w-col 70971201-bc0f-4e85-9c4a-b0632d6849d0">
                            <div className="w-frame wbaseItem-value w-row 89e105c8-9912-493f-a01e-668e7b8b378e">
                                <div className="w-text wbaseItem-value 6dd2565f-4f4a-4af2-81e8-5544f428a565">{i18("KHOI_TAO_HO_SO")}</div>
                            </div>
                            <div className="w-frame wbaseItem-value w-row breadcrumb 0be06ab7-4fb5-4ee9-bcdc-772b75b72a8a">
                                <button type="button" className="w-button wbaseItem-value w-row dc22605e-5503-452f-8ed8-563fb7a402fe event-click">
                                    <div className="w-text wbaseItem-value a077e02e-d416-42e0-bbe9-b6517088d9cc">Hồ sơ chờ xử lý</div>
                                    <div className="w-svg wbaseItem-value fd068ddd-5f33-4854-b678-ec9415ce1f50">
                                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.32236 4.04408C8.96293 3.65197 8.37041 3.65197 8.01097 4.04408C7.66301 4.42368 7.66301 5.03087 8.01097 5.41046L14.0514 12L8.01097 18.5895C7.66301 18.9691 7.66301 19.5763 8.01097 19.9559C8.37041 20.348 8.96293 20.348 9.32236 19.9559L15.989 12.6832C16.337 12.3036 16.337 11.6964 15.989 11.3168L9.32236 4.04408Z" fill="#28282999" fillOpacity="0.6" />
                                        </svg>
                                    </div>
                                </button>
                                <div className="w-text wbaseItem-value 4977e1af-a1ec-47e4-95f4-a39a059103b7">{settingData?.id}</div>
                            </div>
                        </div>
                        <div className="w-frame wbaseItem-value w-row 8d86de47-87c7-4cc8-888d-70255b6d6723">
                            <button onClick={() => onShowProcess(true)} type="button" className="w-button wbaseItem-value w-row f8bc5a04-81d9-4c22-89f7-55efab685fdf">
                                <div className="w-svg wbaseItem-value b8a39fcd-721a-4786-be91-3e18aa2ea845">
                                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8 5.33333V7H5.6V12H8V13.6667H5.6V18.6667H8V20.3333H4.8C4.3584 20.3333 4 19.96 4 19.5V2.83333C4 2.37333 4.3584 2 4.8 2C5.2416 2 5.6 2.37333 5.6 2.83333V5.33333H8Z" fill="#009944FF" />
                                        <path d="M10.3996 8.66699H19.1996C19.6412 8.66699 19.9996 8.29366 19.9996 7.83366V4.50033C19.9996 4.04033 19.6412 3.66699 19.1996 3.66699H10.3996C9.95801 3.66699 9.59961 4.04033 9.59961 4.50033V7.83366C9.59961 8.29366 9.95801 8.66699 10.3996 8.66699Z" fill="#009944FF" />
                                        <path d="M19.1996 22H10.3996C9.95801 22 9.59961 21.6275 9.59961 21.1667V17.8333C9.59961 17.3725 9.95801 17 10.3996 17H19.1996C19.6412 17 19.9996 17.3725 19.9996 17.8333V21.1667C19.9996 21.6275 19.6412 22 19.1996 22Z" fill="#009944FF" />
                                        <path d="M10.3996 15.333H19.1996C19.6412 15.333 19.9996 14.9605 19.9996 14.4997V11.1663C19.9996 10.7063 19.6412 10.333 19.1996 10.333H10.3996C9.95801 10.333 9.59961 10.7063 9.59961 11.1663V14.4997C9.59961 14.9605 9.95801 15.333 10.3996 15.333Z" fill="#009944FF" />
                                    </svg>
                                </div>
                                <div className="w-text wbaseItem-value b6ab1c56-297e-40f9-a193-a8b2ba7ed524">Xem quy trình</div>
                            </button>
                        </div>
                    </div>
                    <div className="w-frame wbaseItem-value w-col 8c14353a-ab5c-4114-9aea-007e0222672d">
                        {
                            settingData?.id &&
                            <ThongTinKhoiTao loanId={settingData?.id} />
                        }
                        <div className="w-frame wbaseItem-value w-row f3851f2e-2983-46c0-ba07-bd2b2a4bd640">
                            <div className="w-frame wbaseItem-value w-col 2b92ef0d-df13-47df-96f3-2ad149cfa688 sidebar-list-option">
                                {
                                    list_sidebar_content.map((ttl, index) =>
                                        <button key={`sidebar-${index}`} type='button' onClick={clickScrollTo} className={`ms-ref  w-row 467260d3-7d85-489d-aa09-52d56b72f54b w-button wbaseItem-value ${scrollIndex === index ? "selected-mini-sidebar-option" : ""}`}>
                                            <div className="w-text wbaseItem-value 9c226e46-29cd-47bf-adcf-744e0db33239 text-color-default-root">{ttl}</div>
                                        </button>
                                    )
                                }
                            </div>
                            <div onScroll={handleScroll} className="w-frame wbaseItem-value w-col 14d79961-33c6-4084-9373-97ac9758052b" scroll="true">
                                <div className="w-frame wbaseItem-value w-col 94819c72-1112-4879-b114-f98434cab142">
                                    <div className="section w-frame wbaseItem-value w-col 2a3c1afe-5014-48ec-a0b3-c4e3eb31e5a6">
                                        <div className="w-frame wbaseItem-value w-row d63b1e18-b09e-402e-9edc-06f443909208">
                                            <div className="w-text wbaseItem-value 81fe85de-3ba2-404e-a58e-e32c4f2a5758">i18("THONG_TIN_EKYC_KHACH_HANG")</div>
                                            <div className="w-frame wbaseItem-value w-row 8696abee-e41a-43dd-bb0a-9244d2adf1a6">
                                                {settingData?.ekycType == "MANUAL" &&
                                                    <a href={`/admin/kyc-history/process-instance?idSub=${settingData?.processInstanceId}`} target="_blank">
                                                        <button type="button" className={`w-button wbaseItem-value w-row`} name-field="Button"
                                                            style={{ backgroundColor: '#FFFFFF' }}

                                                            id="44946b02-92ab-4cfa-8a14-2ec8cb5f849b">
                                                            <div className="w-svg wbaseItem-value" id="726d581d-92f5-40e7-af4a-7465347fcb93">
                                                                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M8.22093 21L1 13.8069L4.2907 10.529L8.22093 14.4556L19.7093 3L23 6.27799L8.22093 21Z" fill={"#FD7A1C"} style={{ mixBlendMode: 'multiply' }} />
                                                                </svg>
                                                            </div>
                                                            <div className="w-text wbaseItem-value" name-field="Text" id="f8fe5080-17a2-42a6-a63b-d985b2bf11c6" style={{ color: '#FD7A1C' }}>KYC</div>
                                                        </button>
                                                    </a>
                                                }
                                                {(settingData?.ekycType === "AUTOMATIC" || !settingData?.ekycType) &&
                                                    <a href={`/admin/ekyc-history/process-instance?idSub=${settingData?.processInstanceId}`} target="_blank">
                                                        <button type="button" className="w-button wbaseItem-value w-row b477c47f-14f2-490c-9d2b-dbbc262bb43d">
                                                            <div className="w-svg wbaseItem-value 1c042023-0eff-4b11-b268-d3e481f08b5d">
                                                                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M8.22093 21L1 13.8069L4.2907 10.529L8.22093 14.4556L19.7093 3L23 6.27799L8.22093 21Z" fill="#009944FF" />
                                                                </svg>
                                                            </div>
                                                            <div className="w-text wbaseItem-value 08d38a36-023c-4941-9ff3-7c08a0d51a9f">eKYC</div>
                                                        </button>
                                                    </a>

                                                }
                                                {processVariables.checkCICR11 != null && processVariables.checkCICR11.data.productResponseDto != null &&
                                                    <button type="button" className="w-button wbaseItem-value w-row 4051ff97-ef40-4785-bf85-db21a797a966" wrap="nowrap" name-field="Button">
                                                        <div className="w-svg wbaseItem-value 50780402-935d-426e-a179-46ccf0948600">
                                                            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <path d="M8.22093 21L1 13.8069L4.2907 10.529L8.22093 14.4556L19.7093 3L23 6.27799L8.22093 21Z" fill="#009944FF" />
                                                            </svg>
                                                        </div>
                                                        <div className="w-text wbaseItem-value 7cf68fd8-4434-4c09-b8ec-b4841b4efcad" name-field="Text">CIC</div>
                                                    </button>
                                                }
                                                {settingData?.ekycType != "MANUAL" &&
                                                    <a href={`/admin/ekyc-history/process-instance?idSub=${settingData?.processInstanceId}`} target="_blank">
                                                        {
                                                            checkStatusBca(typeCheckBCA)
                                                        }
                                                    </a>
                                                }
                                            </div>
                                        </div>
                                        <div className="w-frame wbaseItem-value w-row 78ac4320-fbe7-4283-88c8-84346994da17">
                                            <div className="w-rect wbaseItem-value bd4b945d-5cf6-4d4f-9503-c3dd21aec9c8" style={{ overflow: 'hidden' }} >
                                                {settingData?.pathAnhLiveness ?
                                                    <ImageNFC path={settingData?.pathAnhLiveness} /> :
                                                    <img
                                                        src={`data:image/jpeg;base64,${nfc}`}
                                                        alt="anh-live-ness"
                                                        width={'100%'}
                                                        height={"100%"}
                                                        style={{ objectFit: "cover" }}
                                                    />
                                                }
                                            </div>
                                            <div className="w-frame wbaseItem-value w-row 165e9a35-6ed5-4d72-8455-b8d582d9ab0c" wrap="wrap">
                                                <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md 3b56f506-f2a8-4a00-842c-de48d04938d8">
                                                    <div className="w-frame wbaseItem-value w-col 472d0315-d5c2-4136-8bcd-84f6f9edff86">
                                                        <div className="w-text wbaseItem-value 280e5b96-7662-4871-8de5-c83298274db9">Họ và tên:</div>
                                                        <div className="w-text wbaseItem-value 22a976c4-a629-4641-83ce-e656ec5e613a">
                                                            {customerItem?.hoTen ?? " "}
                                                        </div>
                                                    </div>
                                                    <div className="w-frame wbaseItem-value w-col 94f7cbc1-a39b-4802-b4b6-5426da07a773">
                                                        <div className="w-text wbaseItem-value 673c844c-ae33-41e9-97ed-32922a6c51b3">i18("GIOI_TINH"):</div>
                                                        <div className="w-text wbaseItem-value f0276607-ac2b-4fd8-8bc5-33d90732b05e">
                                                            {customerItem?.gioiTinh ?? " "}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md a1b9888f-e4de-494f-8d4e-02f9cb71217e">
                                                    <div className="w-frame wbaseItem-value w-col 6801e7b5-4ebb-4ca8-aefa-220fb9b3bcc8">
                                                        <div className="w-text wbaseItem-value 2afbb7b6-3bb1-40d2-a485-7ffbffc38243">i18("NGAY_SINH"):</div>
                                                        <div className="w-text wbaseItem-value deea964c-ee1c-45e3-8e59-512282ebd0c4">
                                                            {customerItem?.ngaySinh ?? " "}
                                                        </div>
                                                    </div>
                                                    {/* CHứng minh nhân dân cữ */}
                                                    <div className="wbaseItem-value bd619192-c9b6-48df-abcf-5c4e9b25f883">
                                                        <div className="w-text wbaseItem-value 2afbb7b6-3bb1-40d2-a485-7ffbffc38243">i18("SO_CMND_DA_DUOC_CAP") :{data["process-instance-variables"]?.isCusHaveCmndCu ? "" : <span style={{ font: "inherit", color: "red" }}> *</span>}</div>
                                                        <div className={'w-textformfield wbaseItem-value w-row e8d4f42c-9efd-47a7-9f46-6a11cd4462a1' + (errors?.cccdCu && ' helper-text')}
                                                            helper-text={errors?.cccdCu && errors?.cccdCu?.message}
                                                        >
                                                            <div className="wbaseItem-value 920ce048-f286-4313-b4e6-36ef5aa5f105">
                                                                <div className="textfield">
                                                                    <input
                                                                        maxLength={12}
                                                                        name="cccdCu"
                                                                        disabled={disableCccdCu}
                                                                        placeholder=i18("NHAP_SO_CMND_CU")
                                                                    {...register("cccdCu", {
                                                                        validate: (value) => {
                                                                            if (data["process-instance-variables"].isCusHaveCmndCu == false) {
                                                                                if (!value) {
                                                                                    return i18("NHAP_SO_CMND_CU")
                                                                                }
                                                                                else if (value == "000000000" || value == "111111111" || value == "123123123" || value == "000000000000") {
                                                                                    return i18("VUI_LONG_NHAP_DUNG_SO_CMND_HOAC_LIEN_HE_BO_PHAN_KINH_DOANH_DE_DUOC_HUONG_DAN")
                                                                                }
                                                                                else if (!/^\d{9}$|^\d{12}$/.test(value)) {
                                                                                    return i18("VUI_LONG_NHAP_DUNG_DINH_DANG_CUA_CMND");
                                                                                }
                                                                            } else {
                                                                                if (value) {
                                                                                    if (value == "000000000" || value == "111111111" || value == "123123123" || value == "000000000000") {
                                                                                        return i18("VUI_LONG_NHAP_DUNG_SO_CMND_HOAC_LIEN_HE_BO_PHAN_KINH_DOANH_DE_DUOC_HUONG_DAN")
                                                                                    }
                                                                                    else if (!/^\d{9}$|^\d{12}$/.test(value)) {
                                                                                        return i18("VUI_LONG_NHAP_DUNG_DINH_DANG_CUA_CMND");
                                                                                    }
                                                                                }
                                                                            }
                                                                        },
                                                                    })}
                                                                    onChange={ev => {
                                                                        ev.target.value = ev.target.value?.replace(/\D/g, "");
                                                                        setValue("cccdCu", ev.target.value);
                                                                    }
                                                                    }
                                                                        />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* CHứng minh nhân dân cũ */}
                                                </div>
                                                <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md 837fe1c6-891f-4c35-ad16-0f4dafc2c450">
                                                    <div className="w-frame wbaseItem-value w-col 50d3f97d-c216-413e-942a-c854090c5d65">
                                                        <div className="w-text wbaseItem-value 663957f8-4d10-4d7c-819e-74179f8bea01">i18("QUOC_TICH"):</div>
                                                        <div className="w-text wbaseItem-value 0778391c-5ca0-4ed2-b298-38159a64dce6">
                                                            {customerItem?.quocTich ?? " "}
                                                        </div>
                                                    </div>
                                                    <div className="w-frame wbaseItem-value w-col 26fa1e78-e75a-4d06-9edf-fa22d2003f45">
                                                        <div className="w-text wbaseItem-value d4e80a61-9ef2-4d6c-9c2f-a1469397394e">i18("QUE_QUAN"):</div>
                                                        <div className="w-text wbaseItem-value 1d273428-9b32-4ab7-8e2b-5b6df10a12d3">
                                                            {customerItem?.queQuan}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md 9f28f7b2-070b-4824-a8d0-e0fa6168b8d4">
                                                    <div className="w-frame wbaseItem-value w-col 6573a8ea-8112-4333-98f5-36ddab10a808">
                                                        <div className="w-text wbaseItem-value 27d13b2d-9dfd-41be-9dda-cbdf677e34d5">i18("SO_CCCD"):</div>
                                                        <div className="w-text wbaseItem-value 47951909-3a2b-41fa-84e5-1b29928a315e">
                                                            {customerItem?.cmndHoChieu ?? " "}
                                                        </div>
                                                    </div>
                                                    <div className="w-frame wbaseItem-value w-col 2d8ae80d-df6d-49bc-8136-258caa272e65">
                                                        <div className="w-text wbaseItem-value 016668dc-da24-4533-962b-2c18a711eb1c">i18("NGAY_CAP"):</div>
                                                        <div className="w-text wbaseItem-value d69ba158-3493-4d17-a9d2-b72a304dac62">
                                                            {customerItem?.ngayCap ?? " "}
                                                        </div>
                                                    </div>
                                                    <div className="w-frame wbaseItem-value w-col 105e2bfd-5b33-4ce4-a36d-b0dc4a9ab59b">
                                                        <div className="w-text wbaseItem-value 890fe068-1417-4140-a805-b232db450af5">i18("NGAY_HET_HAN"):</div>
                                                        <div className="w-text wbaseItem-value e28b62d1-4f3a-46c3-9221-cd24ecb5c4d0">
                                                            {customerItem?.ngayHetHan}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* // ! Thông tin người hôn phối (THẾP CHẤP - TIỀN MẶT) */}
                                    <SpouseInfoML
                                        isShow={isHaveSpouse}
                                        danhSachChucVu={danhSachChucVu}
                                        spouseData={spouseData}
                                        fillDataObject={fillDataObject}
                                        title=i18("THONG_TIN_NGUOI_HON_PHOI")
                                    control={control}
                                    register={register}
                                    errors={errors}
                                    clearErrors={clearErrors}
                                    setValue={setValue}
                                    getValues={getValues}
                                    watch={watch}
                                    setError={setError}
                                    spouseFiles={spouseFiles}
                                    style={{ order: 1 }}
                                    ekycStatus={spouseData?.fillDataEkyc}
                                    provinceList={danhSachTinhThanhPho}
                                    danhSachTinhTrangCuTru={danhSachTinhTrangCuTru}
                                    danhSachNgheNghiep={danhSachNgheNghiep}
                                    tinhKetQuaDTI={tinhKetQuaDTI}
                                        />
                                    {/* ! CHƯƠNG TRÌNH VAY VÀ SẢN PHẨM (THẾ CHẤP ) */}
                                    <LoanProgramAndProduct
                                        title=i18("CHUONG_TRINH_VAY_VA_SAN_PHAM")
                                    settingData={settingData}
                                    control={control}
                                    register={register}
                                    errors={errors}
                                    setValue={setValue}
                                    getValues={getValues}
                                    setError={setError}
                                    clearErrors={clearErrors}
                                    watch={watch}
                                    listLoanProgram={listLoanProgram}
                                    disableCTV={disableCTV}
                                    listDealer={listDealer}
                                    processVariables={processVariables}
                                    get_danhSachChuongTrinhVay={get_danhSachChuongTrinhVay}
                                    get_loanProgramDetailsByCode={get_loanProgramDetailsByCode}
                                    update_dataByLoanProgram={update_dataByLoanProgram}
                                    calculate_feeInsurance={calculate_feeInsurance}
                                        />
                                    {/* ! THÔNG TIN HỢP ĐỒNG MUA BÁN (THẾ CHẤP ) */}
                                    <SaleContractInfo
                                        title=i18("THONG_TIN_HOP_DONG_MUA_BAN")
                                    isShow={true}
                                    salesContractInformation={salesContractInformation}
                                    control={control}
                                    register={register}
                                    errors={errors}
                                    setValue={setValue}
                                    clearErrors={clearErrors}
                                    watch={watch}
                                    fillDataObject={fillDataObject}
                                        />
                                    {/* ! THÔNG TIN HÀNG HÓA (THẾ CHẤP) */}
                                    <div className="w-frame wbaseItem-value w-col 998fb714-5803-429d-8f72-41d81eba0145">
                                        <div className="w-frame wbaseItem-value w-row 7b3c0f9d-4ffd-4f47-9c69-3823fc78cb62">
                                            <div className="w-text wbaseItem-value 6f167701-0f89-4e27-b219-73817d7a39d0">i18("THONG_TIN_HANG_HOA")</div>
                                        </div>
                                        <div className="w-frame wbaseItem-value w-row 2a041ef9-4833-4cbe-9b2a-5171a8b5cc6a" wrap="wrap">
                                            <GoodsInformations
                                                values={getValues()}
                                                getValues={getValues}
                                                register={register}
                                                watch={watch}
                                                errors={errors}
                                                control={control}
                                                list_manufacture={list_manufacture}
                                                setValue={setValue}
                                                clearErrors={clearErrors}
                                                dataConfig={processVariables.product}
                                                settingData={settingData}
                                                selected_loanProgram={selected_loanProgram}
                                                setError={setError}
                                                calculate_feeInsurance={calculate_feeInsurance}
                                                tinhKetQuaDTI={tinhKetQuaDTI}
                                                losProductGoods={losProductGoods}
                                            />
                                        </div>
                                        <div style={{ order: "3" }}>
                                            <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md e6545cfa-4e61-4252-b810-61c32a7c22d1">
                                                <div className="w-frame wbaseItem-value w-row 87a659d5-6111-43df-a883-44ff77b97ea1">
                                                    <div className="w-text wbaseItem-value 3eeee597-a758-4418-9154-39cc74e58a14">Tổng giá {processVariables?.product?.secondLevel?.toLowerCase() || 'hàng hóa'}</div>
                                                    <div className="w-text wbaseItem-value 42cd3d29-6f63-4248-8158-fd129ac33e7d">*</div>
                                                </div>
                                                <div style={{ backgroundColor: "white" }} className="w-textformfield wbaseItem-value w-row 40def8c2-11b6-4a9a-99eb-9e73ac2d7958" placeholder="0">
                                                    <div className="wbaseItem-value a9394307-c418-4a7c-b1c0-07fe5d9287f9">
                                                        <div className="textfield">
                                                            <input
                                                                value={Ultis.money(parseFloat(`${watch("tongGiaBan")}`.replaceAll(',', ''))) + " VND"}
                                                                disabled
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* //! THÔNG TIN KHOẢN VAY */}
                                    <LoanInfomationML
                                        title=i18("THONG_TIN_KHOAN_VAY")
                                    settingData={settingData}
                                    control={control}
                                    register={register}
                                    errors={errors}
                                    setValue={setValue}
                                    getValues={getValues}
                                    setError={setError}
                                    clearErrors={clearErrors}
                                    watch={watch}
                                    selected_loanProgram={selected_loanProgram}
                                    ngayHopDongDuKien={ngayHopDongDuKien}
                                    update_listPaymentDate={update_listPaymentDate}
                                    list_paymentData={list_paymentData}
                                    list_loanTerm={list_loanTerm}
                                    checkAgeLoan={checkAgeLoan}
                                    getLSgiaiDoan1={getLSgiaiDoan1}
                                    dispatch={dispatch}
                                    SET_MESSAGE={SET_MESSAGE}
                                    danhSachMucDich={danhSachMucDich}
                                    chungTuThanhToan={chungTuThanhToan}
                                    tinhKetQuaDTI={tinhKetQuaDTI}
                                    calculate_feeInsurance={calculate_feeInsurance}
                                        />
                                    {/* //! BẢO HIỂM */}
                                    {(isHaveVoluntaryInsurance || isHaveCompulsoryInsurance) &&
                                        <div className="w-frame wbaseItem-value w-col 6ffb1980-2a8a-4d95-a90e-41251634f17c">
                                            <div className="w-frame wbaseItem-value w-row 98d38e6a-b49c-4776-9661-fd856d2b4a8a">
                                                <div className="w-text wbaseItem-value 35e49c9e-8edc-4f5a-a433-750d22e568dc">Bảo hiểm</div>
                                            </div>
                                            <div className="w-frame wbaseItem-value w-col c81ca452-c909-4cf4-894e-c197c091a6c2">
                                                {insurance?.length > 0 &&
                                                    insurance.map((item, index) => {
                                                        return (
                                                            InsuranceItem({ item: item, index: index })
                                                        )
                                                    })
                                                }
                                            </div>
                                            {isHaveVoluntaryInsurance &&
                                                <button
                                                    onClick={selected_loanProgram?.insuranceVoluntaryDetails ? addInsurance : () => { }} type="button"
                                                    className={`w-button wbaseItem-value w-row 43407777-94e4-4aa3-8140-6b114310f998 ${selected_loanProgram?.insuranceVoluntaryDetails ? "" : "disable"}`}
                                                >
                                                    <div className="w-svg wbaseItem-value c6a06ce7-d410-44c0-84ab-768e6c147b9b">
                                                        <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M12.9091 2.90909C12.9091 2.40701 12.5021 2 12 2C11.4979 2 11.0909 2.40701 11.0909 2.90909V11.0909H2.90909C2.40701 11.0909 2 11.4979 2 12C2 12.5021 2.40701 12.9091 2.90909 12.9091H11.0909V21.0909C11.0909 21.593 11.4979 22 12 22C12.5021 22 12.9091 21.593 12.9091 21.0909V12.9091H21.0909C21.593 12.9091 22 12.5021 22 12C22 11.4979 21.593 11.0909 21.0909 11.0909H12.9091V2.90909Z" fill="#FFFFFFFF" />
                                                        </svg>
                                                    </div>
                                                    <div className="w-text wbaseItem-value 08bff9c8-8fcd-4667-8607-bd4abda0643e">i18("THEM_BAO_HIEM_TU_NGUYEN")<br />
                                                    </div>
                                                </button>
                                            }
                                            <div className="w-frame wbaseItem-value w-row 74456bc8-cc2b-4ed0-a083-14130887f36d" wrap="wrap">
                                                <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col12-md col12-sm col12 7214a72e-a69e-4001-9bfc-e0e960ebe66c">
                                                    <div className="w-text wbaseItem-value e9b3126d-27c5-4218-bfc8-db879e868ae0">i18("TONG_SO_TIEN_VAY_MUA_BAO_HIEM"):</div>
                                                    <div className="w-text wbaseItem-value 9107cf4c-dace-46d5-9a91-98d2352ace96">{Ultis.money(watch("soTienBaoHiem"))} VND</div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                    {/* //! TỔNG KHOẢNG VAY */}
                                    <div className="w-frame wbaseItem-value w-row 047ab5fa-da22-4b70-bf1b-1cb956c430a0">
                                        <div className="w-text wbaseItem-value f23ab386-e0d1-4a71-888f-0729f2a54f7a">i18("TONG_KHOAN_VAY"):</div>
                                        <div className="w-text wbaseItem-value a9bff5cb-97ac-4559-b440-2e1f18a99c36">{`${Ultis.money(`${Ultis.tryParseFloat(watch("tongKhoanVay"))}`)} VND`}</div>
                                    </div>
                                    {/* //! THÔNG TIN KHÁCH HÀNG BỔ SUNG */}
                                    <div className="w-frame wbaseItem-value w-col 92e5122a-2b68-4971-921b-786baf686cb8">
                                        <div className="w-frame wbaseItem-value w-row 46af7618-475d-42ac-b6f2-d8012bd1e79e">
                                            <div className="w-text wbaseItem-value f0f60534-813c-4523-91e6-d3b88fc688fb">Thông tin khách hàng bổ sung</div>
                                        </div>
                                        <div className="w-frame wbaseItem-value w-row 999f7330-037a-4368-8356-e4f8c562f415" wrap="wrap">
                                            <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md 45f73610-d264-4eec-b019-cc548be4198e">
                                                <div className="w-frame wbaseItem-value w-row 74bee406-ffc3-4400-a75b-af70b1c052be">
                                                    <div className="w-text wbaseItem-value fb1d7791-70bc-458f-9a41-2ca9c7570f0f">i18("TEN_THUONG_GOI_O_NHA")</div>
                                                </div>
                                                <div className={"w-textformfield wbaseItem-value w-row 1553307f-fd10-4679-a62d-9b2d1584a217 "}
                                                    name-field="RoleID" placeholder=i18("NHAP_TEN_TEN_GOI_O_NHA")
                                                    >
                                                <div className="wbaseItem-value ee5c5ee0-f72f-480e-9462-53f6362a2d1f" name-field="Textfield">
                                                    <div className="textfield">
                                                        <input
                                                            maxLength="100"
                                                            name="tenONha"
                                                            placeholder=i18("NHAP_TEN_TEN_GOI_O_NHA")
                                                        {...register("tenONha")}
                                                                />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md 8f5a4d98-5020-4124-b6a8-abd9801c0584">
                                            <div className="w-frame wbaseItem-value w-row da7478eb-87b4-4eac-917f-c9d63d53e238">
                                                <div className="w-text wbaseItem-value cb29aeee-8bdd-4b62-ad40-593ef971c5ee">i18("TRINH_DO_HOC_VAN")</div>
                                                <div className="w-text wbaseItem-value 752656b5-923a-4499-a2f3-4a3f4b54d86f">*</div>
                                            </div>
                                            <Controller
                                                name={"maTrinhDoHocVan"}
                                                control={control}
                                                {...register(`maTrinhDoHocVan`)}
                                                style={{ order: 2 }}
                                                rules={{ required: i18("VUI_LONG_CHON_TRINH_DO_HOC_VAN") }}
                                                render={({ field }) => (
                                                    <div
                                                        className={`select2-custom ${errors.maTrinhDoHocVan && 'helper-text'}`}
                                                        helper-text={errors.maTrinhDoHocVan && i18("VUI_LONG_CHON_TRINH_DO_HOC_VAN")}
                                                        placeholder={i18("CHON_TRINH_DO_HOC_VAN")}
                                                    >
                                                        <Select2 {...field}
                                                            data={danhSachTrinhDoHocVan.map((item, _) => { return { name: item.name, id: item.code } })}
                                                            options={{ placeholder: i18("CHON_TRINH_DO_HOC_VAN") }}
                                                            onChange={(ev) => {
                                                                if (ev.target.value !== "" && ev.target.value != getValues("maTrinhDoHocVan")) {
                                                                    let selected = danhSachTrinhDoHocVan.find((e) => e.code == ev.target.value);
                                                                    setValue('maTrinhDoHocVan', ev.target.value);
                                                                    setValue('tenTrinhDoHocVan', selected.name);
                                                                    clearErrors("maTrinhDoHocVan");
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            />
                                        </div>
                                        <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md 9fce7320-1aa7-47ba-b2f4-b4d64b5ed87d">
                                            <div className="w-frame wbaseItem-value w-row f4fac274-8e7a-426a-9f40-e73e7cb64dde">
                                                <div className="w-text wbaseItem-value 7ec332ff-f6f7-48c9-8d29-af458869e183">i18("SO_DIEN_THOAI_DI_DONG")</div>
                                                <div className="w-text wbaseItem-value 83ff1f0b-99b5-4e31-b8ce-542f37194d0e">*</div>
                                            </div>
                                            <div className="w-textformfield wbaseItem-value w-row b5374a55-ccd0-41e8-be1c-a11eefc862e6" placeholder>
                                                <div className="wbaseItem-value c1e1c0ac-e055-4b71-b99f-80cc7dd1d792" cateid={86}>
                                                    <div className="textfield">
                                                        <input
                                                            value={customerItem?.dtDiDong}
                                                            disabled
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div >
                                    {/* i18("DIA_CHI") trên Chip */}
                                    < div className="w-frame wbaseItem-value w-row address-chip" wrap="wrap" >
                                        <div className="w-frame wbaseItem-value w-col col- col18-xxl col12-xl col12-lg col24-md f36a919a-3236-41f9-a459-c613745d4f87">
                                            <div className="w-frame wbaseItem-value w-row d4964a51-0eaa-475d-940c-7f0548f36f71">
                                                <div className="w-text wbaseItem-value 81a3ae7b-e4ce-4a91-bc23-0335328d1f60">i18("DIA_CHI") thường trú ( {settingData?.ekycType == 'MANUAL' ? 'QR' : 'NFC'} ) :</div>
                                            </div>
                                            <div className="w-textformfield wbaseItem-value w-row 4660867d-57ea-4677-a063-b50bf1569874" placeholder>
                                                <div className="wbaseItem-value 25e475f7-36ce-4b53-bb44-54dd94cd0efc" cateid={86}>
                                                    <div className="textfield">
                                                        <input
                                                            value={settingData?.dcThuongTruChipQr}
                                                            disabled
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div >
                                    {/* switch */}
                                    <div className="w-frame wbaseItem-value w-row col- col6-xxl col6-xl col12-lg col24-md switch-able-chip">
                                        {isLoadingAddress ?
                                            < FontAwesomeIcon icon={faSpinner} spin style={{ color: "#009944FF", order: 1 }} />
                                            :
                                            <label
                                                onClick={onChangeCheckAddressChip}
                                                className="w-switch wbaseItem-value f10b19a9-de21-4b33-ad04-7ae2f2a30dbe cursor-pointer">
                                                <input
                                                    checked={isCheckAddressChip}
                                                    type="checkbox"
                                                    name="Switch"
                                                    disabled
                                                />
                                                <span className="slider" />
                                            </label>
                                        }
                                        <div className="w-frame wbaseItem-value w-row adff7cc6-ce76-4008-8460-c82d418c39e6">
                                            <div className="w-text wbaseItem-value adrress-qr-chip-text">i18("DIA_CHI_THUONG_TRU_TRUNG_VOI_DIA_CHI") {settingData?.ekycType == 'MANUAL' ? i18("THUONG_TRU_MA_QR_") : i18("TRONG_CHIP")} </div>
                                        </div>
                                    </div>
                                    {/* i18("DIA_CHI") trên Chip */}
                                    <div className="w-frame wbaseItem-value w-row f824944e-2c8f-4770-bd23-9ff4f2362c7e" wrap="wrap">
                                        <TextField
                                            control={control}
                                            keyName="dcThuongTru"
                                            required={!isCheckAddressChip}
                                            type="text"
                                            title=i18("DIA_CHI_THUONG_TRU")
                                        placeholder=i18("NHAP_DIA_CHI_THUONG_TRU")
                                        style={{ order: 1 }}
                                        register={register}
                                        requiredMessage=i18("VUI_LONG_NHAP_DIA_CHI_THUONG_TRU")
                                        errors={errors}
                                        disable={isCheckAddressChip}
                                        onChangeInput={(event) => {
                                            setCheckDcThuongTru(1);
                                            setValue("dcThuongTru", event.target.value);
                                            if (watch("isTamTruGiongThuongTru")) setValue("dcTamTru", event.target.value);
                                        }
                                        }
                                                />
                                        <RenDerPronvinces />
                                        <RenDerDistricts />
                                        <RenderWards />
                                    </div>
                                    <div className="w-frame wbaseItem-value w-row col- col6-xxl col6-xl col12-lg col24-md 84928732-b60a-4c8c-9ea8-69182ae9dba2">
                                        <label
                                            onClick={async () => {
                                                const value = !watch("isTamTruGiongThuongTru");
                                                setValue("isTamTruGiongThuongTru", value);
                                                const provinceCodeTemp = watch('provinceCodeTemp');
                                                const districtCodeTemp = watch('districtCodeTemp');
                                                const wardCodeTemp = watch('wardCodeTemp');
                                                if (provinceCodeTemp == "" || districtCodeTemp == "" || wardCodeTemp == "") {
                                                    setShowPopupDC(true);
                                                    setValue("isTamTruGiongThuongTru", false);
                                                }
                                                else if (value) {
                                                    const selectedProvince = danhSachTinhThanhPho.find(province => province?.code == provinceCodeTemp);
                                                    const selectedDistrict = danhSachQuanHuyenThuongTru.find(district => district?.code == districtCodeTemp);
                                                    const selectedWard = danhSachPhuongXaThuongTru.find(ward => ward?.code == wardCodeTemp);
                                                    setProvinceTempName(selectedProvince?.fullName);
                                                    setDistrictTempName(selectedDistrict?.fullName);
                                                    setWardTempName(selectedWard?.fullName);
                                                    setValue("dcTamTru", watch("dcThuongTru"));
                                                    setValue("currentAddressProvincesName", selectedProvince?.fullName);
                                                    setValue("currentAddressDistrictName", selectedDistrict?.fullName);
                                                    setValue("currentAddressWardsName", selectedWard?.fullName);
                                                    setValue("currentAddressProvincesCode", provinceCodeTemp || customerItem.addressProvincesCode);
                                                    setValue("currentAddressDistrictCode", districtCodeTemp || customerItem.addressDistrictCode);
                                                    setValue("currentAddressWardsCode", wardCodeTemp || customerItem.addressWardsCode);
                                                    tinhKetQuaDTI(getValues(), false);
                                                } else {
                                                    setValue("dcTamTru", null);
                                                    setValue("currentAddressProvincesName", null);
                                                    setValue("currentAddressDistrictName", null);
                                                    setValue("currentAddressWardsName", null);
                                                    setValue("currentAddressProvincesCode", null);
                                                    setValue("currentAddressDistrictCode", null);
                                                    setValue("currentAddressWardsCode", null);
                                                    tinhKetQuaDTI(getValues(), false);
                                                }
                                            }}
                                            className="w-switch wbaseItem-value f10b19a9-de21-4b33-ad04-7ae2f2a30dbe cursor-pointer">
                                            <input
                                                checked={watch("isTamTruGiongThuongTru")}
                                                type="checkbox"
                                                name="Switch"
                                                disabled
                                            />
                                            <span className="slider" />
                                        </label>
                                        <div className="w-frame wbaseItem-value w-row adff7cc6-ce76-4008-8460-c82d418c39e6">
                                            <div className="w-text wbaseItem-value 3d63051f-8cb9-4b56-adb8-a6a1646c3f30">i18("DIA_CHI_THUONG_TRU_GIONG_VOI_NOI_O_HIEN_TAI")</div>
                                        </div>
                                    </div>
                                    {
                                        watch("isTamTruGiongThuongTru") ?
                                            <div style={{ order: 5 }} className="w-frame wbaseItem-value w-row f824944e-2c8f-4770-bd23-9ff4f2362c7e" wrap="wrap">
                                                <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md f36a919a-3236-41f9-a459-c613745d4f87">
                                                    <div className="w-frame wbaseItem-value w-row d4964a51-0eaa-475d-940c-7f0548f36f71">
                                                        <div className="w-text wbaseItem-value 81a3ae7b-e4ce-4a91-bc23-0335328d1f60">Nơi ở hiện tại</div>
                                                        <div className="w-text wbaseItem-value c7a3925f-9ee4-4e56-99aa-4a685dda00ec">*</div>
                                                    </div>
                                                    <div className="w-textformfield wbaseItem-value w-row 4660867d-57ea-4677-a063-b50bf1569874" placeholder>
                                                        <div className="wbaseItem-value 25e475f7-36ce-4b53-bb44-54dd94cd0efc">
                                                            <div className="textfield">
                                                                <input
                                                                    value={watch('dcThuongTru')}
                                                                    name="dcTamTru"
                                                                    disabled
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md b4167392-f4f4-413e-b110-02c8a4756fa4">
                                                    <div className="w-frame wbaseItem-value w-row b912b24b-fff2-4002-9401-c796772539f7">
                                                        <div className="w-text wbaseItem-value 9e5a1b40-edc7-4b05-a977-b8b4ec8f9f2b">Tỉnh/Thành phố</div>
                                                        <div className="w-text wbaseItem-value 734dd831-b6fc-46a3-bf18-cab01d56f38b">*</div>
                                                    </div>
                                                    <div className="w-textformfield wbaseItem-value w-row 74526e37-2348-4139-beda-23ec11814603" placeholder>
                                                        <div className="wbaseItem-value f55b4a03-2f61-4a4d-98c6-2d1935a67c42" cateid={86}>
                                                            <div className="textfield">
                                                                <input
                                                                    value={provinceTempName}
                                                                    {...register("addressProvincesName")}
                                                                    disabled
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md 7d8183d9-7379-4bfd-a140-0bb93601f5e0">
                                                    <div className="w-frame wbaseItem-value w-row 1fb17aac-47be-43fd-82b3-7a1725e2a4d2">
                                                        <div className="w-text wbaseItem-value 6947f263-f00e-4e02-bbd9-677d97e14a40">Quận/Huyện</div>
                                                        <div className="w-text wbaseItem-value 1f442f92-704a-43c0-95a8-46c695532d29">*</div>
                                                    </div>
                                                    <div className="w-textformfield wbaseItem-value w-row b76ecdc0-018c-451a-bee1-97a7cfc08ece" placeholder>
                                                        <div className="wbaseItem-value 2328de85-bca9-4ea6-8ab6-f440f989081b" cateid={86}>
                                                            <div className="textfield">
                                                                <input
                                                                    value={districtTempName}
                                                                    {...register("addressDistrictName")}
                                                                    disabled
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md b312cd68-f342-40f6-aa1f-fa9dce4f2407">
                                                    <div className="w-frame wbaseItem-value w-row 1c4d3264-2c3f-47d9-8cce-13f3ad1a1e69">
                                                        <div className="w-text wbaseItem-value 231bf7bc-0667-4602-9baf-7c62a35cd2b9">Phường/Xã</div>
                                                        <div className="w-text wbaseItem-value 638c2e4e-3e7a-4a27-bb59-7c7227a61254">*</div>
                                                    </div>
                                                    <div className="w-textformfield wbaseItem-value w-row 9fee64a7-4ad4-4ffc-bb4a-455f665e04ca" placeholder>
                                                        <div className="wbaseItem-value 7ef27c7b-63b5-4e4f-b720-6db9318972a8" cateid={86}>
                                                            <div className="textfield">
                                                                <input
                                                                    value={wardTempName}
                                                                    {...register("addressWardsName")}
                                                                    disabled
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            :
                                            <div className="w-frame wbaseItem-value w-row 67e0d3ac-536c-4e2c-b46d-62f60d16f472" wrap="wrap">
                                                <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md 6ca593b8-e9d3-448e-b0b2-2f8e01d9f043">
                                                    <div className="w-frame wbaseItem-value w-row fc154698-5d9c-4b65-bebd-f5c2b3fc6a47">
                                                        <div className="w-text wbaseItem-value 1c3a75f0-5e7b-462a-988f-aa9e61063100">Nơi ở hiện tại<br /></div>
                                                        <div className="w-text wbaseItem-value b5dff7ae-5898-4701-8505-892a811788d0">*</div>
                                                    </div>
                                                    <div className={`w-textformfield wbaseItem-value w-row 1553307f-fd10-4679-a62d-9b2d1584a217 ${errors.dcTamTru && 'helper-text'}`}
                                                        helper-text={errors.dcTamTru && "Vui lòng nhập địa chỉ tạm trú"}
                                                        placeholder={"Nhập địa chỉ tạm trú"} name-field="Status" style={{ order: 2 }}>
                                                        <div className="wbaseItem-value 217b9f90-384d-4edc-845b-7db38fbdc754" cateid={86}>
                                                            <div className="textfield">
                                                                <input
                                                                    value={watch("dcTamTru") ?? ""}
                                                                    {...register("dcTamTru", { required: "Vui lòng nhập địa chỉ tạm trú" })}
                                                                    placeholder={"Nhập địa chỉ tạm trú"}
                                                                    maxLength={"100"}
                                                                    onChange={(ev) => {
                                                                        setValue('dcTamTru', ev.target.value);
                                                                        if (ev.target.value) {
                                                                            clearErrors("dcTamTru");
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md 480d9be5-db6f-4fdd-b965-e592e8bac251">
                                                    <div className="w-frame wbaseItem-value w-row 08703dee-a362-4010-9b72-43db5dc66d13">
                                                        <div className="w-text wbaseItem-value 8e0824a6-457a-4ca7-9e40-b5dce9a4249b">Tỉnh/Thành phố<br />
                                                        </div>
                                                        <div className="w-text wbaseItem-value 60cc84db-4e46-4d17-be71-40d093fffd2e">*</div>
                                                    </div>
                                                    <Controller
                                                        name={"currentAddressProvincesCode"}
                                                        control={control}
                                                        {...register(`currentAddressProvincesCode`)}
                                                        style={{ order: 2 }}
                                                        rules={{ required: watch("isTamTruGiongThuongTru") ? false : i18("VUI_LONG_CHON_TINH_THANH_PHO") }}
                                                        render={({ field }) => (
                                                            <div
                                                                className={`select2-custom ${errors.currentAddressProvincesCode && 'helper-text'}`}
                                                                helper-text={errors.currentAddressProvincesCode && i18("VUI_LONG_CHON_TINH_THANH_PHO")}
                                                                placeholder={i18("CHON_TINH_THANH_PHO")}
                                                            >
                                                                <Select2 {...field}
                                                                    data={danhSachTinhThanhPho?.length > 0 ? danhSachTinhThanhPho.map((item, _) => { return { name: item.fullName, id: item.code } }) : []}
                                                                    options={{ placeholder: i18("CHON_TINH_THANH_PHO") }}
                                                                    onChange={async (ev) => {
                                                                        if (ev.target.value !== "" && ev.target.value != getValues("currentAddressProvincesCode")) {
                                                                            let selected = danhSachTinhThanhPho.find((e) => e.code == ev.target.value);
                                                                            setValue('currentAddressProvincesCode', ev.target.value);
                                                                            setValue('currentAddressProvincesName', selected.fullName);
                                                                            setQuanHuyen([]);
                                                                            setPhuongXa([]);
                                                                            await getDanhSachQuanHuyen(ev.target.value);
                                                                            clearErrors("currentAddressProvincesCode");
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                                <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md 2e6dafb7-970c-4bcf-a3cf-5eb8568e6b21">
                                                    <div className="w-frame wbaseItem-value w-row 3d912628-6891-482d-8527-bbc904799ba2">
                                                        <div className="w-text wbaseItem-value 0bc73c21-91a5-4580-a862-97e38d3cfbea">Quận/Huyện<br />
                                                        </div>
                                                        <div className="w-text wbaseItem-value 23f564c5-1052-447e-a307-24b427b2d3f1">*</div>
                                                    </div>
                                                    <Controller
                                                        name={"currentAddressDistrictCode"}
                                                        control={control}
                                                        {...register(`currentAddressDistrictCode`)}
                                                        style={{ order: 2 }}
                                                        rules={{ required: i18("VUI_LONG_CHON_QUAN_HUYEN") }}
                                                        render={({ field }) => (
                                                            <div
                                                                className={`select2-custom ${errors.currentAddressDistrictCode && 'helper-text'}`}
                                                                helper-text={errors.currentAddressDistrictCode && errors.currentAddressDistrictCode.message}
                                                                placeholder={i18("CHON_QUAN_HUYEN")}
                                                            >
                                                                <Select2 {...field}
                                                                    data={danhSachQuanHuyen?.length > 0 ? danhSachQuanHuyen.map((item, _) => { return { name: item.fullName, id: item.code } }) : []}
                                                                    options={{ placeholder: i18("CHON_QUAN_HUYEN") }}
                                                                    onChange={async (ev) => {
                                                                        if (ev.target.value !== "" && ev.target.value != getValues("currentAddressDistrictCode")) {
                                                                            let selected = danhSachQuanHuyen.find((e) => e.code == ev.target.value);
                                                                            setValue('currentAddressDistrictCode', ev.target.value);
                                                                            setValue('currentAddressDistrictName', selected.fullName);
                                                                            setPhuongXa([]);
                                                                            await getDanhSachPhuongXa(ev.target.value);
                                                                            tinhKetQuaDTI(getValues(), false);
                                                                            clearErrors("currentAddressDistrictCode");
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                                <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md 0e51004f-741e-4730-beab-3e7e85e9eb74">
                                                    <div className="w-frame wbaseItem-value w-row 4c7d9103-92db-4f97-98df-d60796882681">
                                                        <div className="w-text wbaseItem-value 387c7c48-ce57-4430-99eb-8410469c340c">Phường/Xã</div>
                                                        <div className="w-text wbaseItem-value e41302b2-7160-42fb-a2a1-d0e6a6d47203">*</div>
                                                    </div>
                                                    <Controller
                                                        name={"currentAddressWardsCode"}
                                                        control={control}
                                                        {...register(`currentAddressWardsCode`)}
                                                        style={{ order: 2 }} rules={{ required: i18("VUI_LONG_CHON_PHUONG_XA") }}
                                                        render={({ field }) => (
                                                            <div
                                                                className={`select2-custom ${errors.currentAddressWardsCode && 'helper-text'}`}
                                                                helper-text={errors.currentAddressWardsCode && errors.currentAddressWardsCode.message}
                                                                placeholder={i18("CHON_PHUONG_XA")}
                                                            >
                                                                <Select2 {...field}
                                                                    data={danhSachPhuongXa?.length > 0 ? danhSachPhuongXa.map((item, _) => { return { name: item.fullName, id: item.code } }) : []}
                                                                    options={{ placeholder: i18("CHON_PHUONG_XA") }}
                                                                    onChange={async (ev) => {
                                                                        if (ev.target.value !== "" && ev.target.value != getValues("currentAddressWardsCode")) {
                                                                            let selected = danhSachPhuongXa.find((e) => e.code == ev.target.value);
                                                                            setValue('currentAddressWardsCode', ev.target.value);
                                                                            setValue('currentAddressWardsName', selected.fullName);
                                                                            clearErrors("currentAddressWardsCode");
                                                                        }
                                                                    }}
                                                                />
                                                            </div>
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                    }
                                    <div className="w-frame wbaseItem-value w-row 67e0d3ac-536c-4e2c-b46d-62f60d16f472" wrap="wrap">
                                        <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md 0143cf6b-5ce7-4d25-af3e-c4340eaf8c97">
                                            <div className="w-frame wbaseItem-value w-row 94293f9f-ca41-4713-a1d3-81f5a004607e">
                                                <div className="w-text wbaseItem-value ee050f4c-b71c-4943-8d93-19ea8b24626a">i18("THOI_GIAN_CU_TRU")<br />
                                                </div>
                                                <div className="w-text wbaseItem-value 87442c9e-bcfe-4c4e-b442-fd8569e612b4">*</div>
                                            </div>
                                            <div className="w-frame wbaseItem-value w-row 9e645799-71bf-473c-9771-63bd53cb431d">
                                                <div className={"w-textformfield wbaseItem-value w-row 1553307f-fd10-4679-a62d-9b2d1584a217 " + (errors.namCuTru && 'helper-text')}
                                                    helper-text={errors.namCuTru && errors.namCuTru.message}
                                                >
                                                    <div className="wbaseItem-value ee5c5ee0-f72f-480e-9462-53f6362a2d1f"
                                                        cateid={86}>
                                                        <div className="textfield">
                                                            <input
                                                                maxLength={2}
                                                                {...register("namCuTru", { required: i18("VUI_LONG_NHAP_SO_NAM") })}
                                                                placeholder="0"
                                                                onChange={(event) => {
                                                                    if (event.target.value !== "") {
                                                                        clearErrors("namCuTru");
                                                                    }
                                                                    event.target.value = event.target.value.replace(/\D/g, "");
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="w-text wbaseItem-value 672c0e54-75e0-45cb-b5c0-f912b0deadde">
                                                            Năm
                                                        </div>
                                                    </div>
                                                </div >
                                                <div className={"w-textformfield wbaseItem-value w-row 1553307f-fd10-4679-a62d-9b2d1584a217 " + (errors.thangCuTru && 'helper-text')}
                                                    placeholder=i18("NHAP_SO_THANG")
                                                helper-text={errors.thangCuTru && errors.thangCuTru.message}
                                                        >
                                                <div className="wbaseItem-value ee5c5ee0-f72f-480e-9462-53f6362a2d1f">
                                                    <div className="textfield">
                                                        <input
                                                            maxLength={2}
                                                            {...register("thangCuTru", { required: i18("VUI_LONG_NHAP_SO_THANG") })}
                                                            placeholder="0"
                                                            onChange={(event) => {
                                                                if (event.target.value !== "") {
                                                                    clearErrors("thangCuTru");
                                                                }
                                                                event.target.value = event.target.value.replace(/\D/g, "");
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="w-text wbaseItem-value 672c0e54-75e0-45cb-b5c0-f912b0deadde">
                                                        Tháng
                                                    </div>
                                                </div>
                                            </div>
                                        </div >
                                    </div >
                                    <div className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md b1523b3c-a4a3-47d7-bfee-bbf3ab7be4f6">
                                        <div className="w-frame wbaseItem-value w-row d3acf66d-1dc3-4d58-917a-633f4a0da4e2">
                                            <div className="w-text wbaseItem-value afe374bf-60b1-4cac-a1ef-f856c8776092">i18("TINH_TRANG_CU_TRU")</div>
                                            <div className="w-text wbaseItem-value e9703acd-8259-45d2-9876-80834b5bc259">*</div>
                                        </div>
                                        <Controller
                                            name={"maTtNoiCuTru"}
                                            control={control}
                                            {...register(`maTtNoiCuTru`)}
                                            style={{ order: 2 }}
                                            rules={{ required: i18("VUI_LONG_CHON_TINH_TRANG_CU_TRU") }}
                                            render={({ field }) => (
                                                <div
                                                    className={`select2-custom ${errors.maTtNoiCuTru && 'helper-text'}`}
                                                    helper-text={errors.maTtNoiCuTru && errors.maTtNoiCuTru.message}
                                                    placeholder={i18("CHON_TINH_TRANG_CU_TRU")}
                                                >
                                                    <Select2 {...field}
                                                        data={danhSachTinhTrangCuTru?.length > 0 ? danhSachTinhTrangCuTru.map((item, _) => { return { name: item.name, id: item.code } }) : []}
                                                        options={{ placeholder: i18("CHON_TINH_TRANG_CU_TRU") }}
                                                        onChange={async (ev) => {
                                                            if (ev.target.value !== "" && ev.target.value != getValues("maTtNoiCuTru")) {
                                                                let selected = danhSachTinhTrangCuTru.find((e) => e.code == ev.target.value);
                                                                setValue('maTtNoiCuTru', ev.target.value);
                                                                setValue('ttNoiCuTru', selected.name);
                                                                clearErrors("maTtNoiCuTru");
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>
                                </div >
                            </div >
                            {/* //! CÔNG VIỆC KHÁCH HÀNG */}
                            <div className="w-frame wbaseItem-value w-col aed2a4da-5952-40c2-bb0c-f561602b9e46" >
                                <div className="w-frame wbaseItem-value w-row 1f7ffc40-fc92-4556-8bc0-e929ad3b3b53">
                                    <div className="w-text wbaseItem-value 6cc29a61-1511-49e6-9c8b-5c13f678dcd9">Công việc khách hàng</div>
                                </div>
                                <div className="w-frame wbaseItem-value w-row 7054c001-aee8-47db-950f-3050cde0629b" wrap="wrap">
                                    <div style={{ order: 2 }} className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md becae86d-efe5-4f17-ab3d-899932d5c5e3">
                                        <div className="w-frame wbaseItem-value w-row 0e42da4d-8967-45ec-9884-05b48b1d278e">
                                            <div className="w-text wbaseItem-value 4a87d573-81b4-4808-a9bb-370b2b0e8b42">i18("NGHE_NGHIEP")</div>
                                            <div className="w-text wbaseItem-value 74a2f295-d11d-4524-b461-5112203cfc81">*</div>
                                        </div>
                                        <Controller
                                            name={"maNgheNghiep"}
                                            control={control}
                                            {...register(`maNgheNghiep`)}
                                            style={{ order: 2 }}
                                            rules={{ required: i18("VUI_LONG_CHON_NGHE_NGHIEP") }}
                                            render={({ field }) => (
                                                <div
                                                    className={`select2-custom ${errors.maNgheNghiep && 'helper-text'}`}
                                                    helper-text={errors.maNgheNghiep && errors.maNgheNghiep.message}
                                                    placeholder={i18("CHON_NGHE_NGHIEP")}
                                                >
                                                    <Select2 {...field}
                                                        data={danhSachNgheNghiep?.length > 0 ? danhSachNgheNghiep.map((item, _) => { return { name: item.name, id: item.code } }) : []}
                                                        options={{ placeholder: i18("CHON_NGHE_NGHIEP") }}
                                                        onChange={async (ev) => {
                                                            if (ev.target.value !== "" && ev.target.value != getValues("maNgheNghiep")) {
                                                                let selected = danhSachNgheNghiep.find((e) => e.code == ev.target.value);
                                                                setValue('maNgheNghiep', ev.target.value);
                                                                setValue('tenNgheNghiep', selected.name);
                                                                clearErrors("maNgheNghiep");
                                                            }
                                                        }}
                                                        style={{ maxWidth: 'calc((100% * 6 / 24) - var(--gutter) * 3 / 4)' }}
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <TextField
                                        control={control}
                                        keyName="noiLamViec"
                                        required={true}
                                        type="text"
                                        title=i18("TEN_CONG_TY_NOI_LAM_VIEC")
                                    placeholder=i18("NHAP_TEN_CONG_TY")
                                    style={{ order: 2 }}
                                    requiredMessage=i18("VUI_LONG_NHAP_TEN_CONG_TY")
                                    errors={errors}
                                    maxLength={100}
                                                />
                                    <TextField
                                        control={control}
                                        keyName="dcNoiLamViec"
                                        required={true}
                                        type="text"
                                        title=i18("DIA_CHI_NOI_LAM_VIEC")
                                    placeholder=i18("NHAP_DIA_CHI_NOI_LAM_VIEC")
                                    style={{ order: 2 }}
                                    requiredMessage=i18("VUI_LONG_NHAP_DIA_CHI_NOI_LAM_VIEC")
                                    errors={errors}
                                    maxLength={100}
                                                />
                                    <div style={{ order: 2 }} className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md 053ae8e1-de6b-4dd0-8e59-b63162a5afa3">
                                        <div className="w-frame wbaseItem-value w-row b53c09f2-4c00-4f3f-8d9d-e8b6a63fa976">
                                            <div className="w-text wbaseItem-value 03219885-ab24-409f-bace-d735105f8a6e">i18("CHUC_VU")</div>
                                            <div className="w-text wbaseItem-value 0707dbfb-3fa7-4c7e-bbd8-a222c97a475d">*</div>
                                        </div>
                                        <Controller
                                            name={"maChucVu"}
                                            control={control}
                                            {...register(`maChucVu`)}
                                            style={{ order: 2 }}
                                            rules={{ required: i18("VUI_LONG_CHON_CHUC_VU") }}
                                            render={({ field }) => (
                                                <div
                                                    className={`select2-custom ${errors.maChucVu && 'helper-text'}`}
                                                    helper-text={errors.maChucVu && errors.maChucVu.message}
                                                    placeholder={i18("CHON_CHON_CHUC_VU")}
                                                >
                                                    <Select2 {...field}
                                                        data={danhSachChucVu?.length > 0 ? danhSachChucVu.map((item, _) => { return { name: item.name, id: item.code } }) : []}
                                                        options={{ placeholder: i18("CHON_CHON_CHUC_VU") }}
                                                        onChange={async (ev) => {
                                                            if (ev.target.value !== "" && ev.target.value != getValues("maChucVu")) {
                                                                let selected = danhSachChucVu.find((e) => e.code == ev.target.value);
                                                                setValue('maChucVu', ev.target.value);
                                                                setValue('tenChucVu', selected.name);
                                                                clearErrors("maChucVu");
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        />
                                    </div>
                                    <TextField
                                        control={control}
                                        keyName="thoiGianNamLamViec"
                                        required={true}
                                        type="number"
                                        title=i18("THOI_GIAN_LAM_VIEC")
                                    placeholder="0"
                                    style={{ order: 2 }}
                                    requiredMessage=i18("VUI_LONG_NHAP_NAM_LAM_VIEC")
                                    errors={errors}
                                    afterInput=i18("NAM")
                                    col={3}
                                                />
                                    <TextField
                                        control={control}
                                        keyName="thoiGianThangLamViec"
                                        required={true}
                                        type="number"
                                        placeholder="0"
                                        style={{ order: 2 }}
                                        requiredMessage=i18("VUI_LONG_NHAP_THANG_LAM_VIEC")
                                    errors={errors}
                                    afterInput=i18("THANG")
                                    col={3}
                                                />
                                    <TextField
                                        control={control}
                                        keyName="dtNoiLamViec"
                                        type="number"
                                        title=i18("SO_DIEN_THOAI_CONG_TY")
                                    placeholder=i18("NHAP_SO_DIEN_THOAI_CONG_TY")
                                    style={{ order: 2 }}
                                    requiredMessage=i18("VUI_LONG_NHAP_SO_DIEN_THOAI_CONG_TY")
                                    errors={errors}
                                    maxLength={12}
                                                />
                                </div>
                            </div >
                            {/* //! TÀI CHÍNH KHÁCH HÀNG */}
                            <CustomerFinace
                                title=i18("TAI_CHINH_KHACH_HANG")
                            control={control}
                            watch={watch}
                            getValues={getValues}
                            register={register}
                            errors={errors}
                            clearErrors={clearErrors}
                            setValue={setValue}
                            danhSachNgheNghiep={danhSachNgheNghiep}
                            tinhKetQuaDTI={tinhKetQuaDTI}
                                        />
                            {/* //! ĐIỂM DTI */}
                            < div className="w-frame wbaseItem-value w-row b34d481e-f2e3-465e-9be4-da1e0879e6ee" >
                                <div className="w-frame wbaseItem-value w-col col- 3c89acae-de8a-4879-aed3-f762536c747c">
                                    <div className="w-text wbaseItem-value 3a93547d-492b-4cd9-9a02-8d3728849045">i18("DIEM_DTI"):</div>
                                    <div className="w-text wbaseItem-value 99c3dbd2-99c0-44f6-bb7c-d2fc78e03f92">{watch("diemDTI") ? watch("diemDTI") + " %" : "-"}</div>
                                </div>
                                <div className="w-frame wbaseItem-value w-col col- af365d57-f31e-4bee-9f00-857aa620f8ee">
                                    <div className="w-text wbaseItem-value d529232e-9f7a-4ebc-b007-13f167237db3">i18("KET_QUA_DTI"):
                                    </div>
                                    <div className="w-text wbaseItem-value 9dc68d34-d58d-4845-ae69-77362e5e39d5">{watch("ketQuaDTI") ?? "-"}</div>
                                </div>
                                <button
                                    onClick={() => {
                                        setDeXuatKhoangVay(true)
                                    }}
                                    style={{ display: getValues("diemDTI") ? "flex" : "none" }}
                                    type="button" className="w-button wbaseItem-value w-row efd25fa1-d6ed-4d23-a89e-b2309cc08851">
                                    <div className="w-text wbaseItem-value 57dd0e16-89c8-45e3-a489-7f47fda59d6c">i18("DE_XUAT_KHOAN_VAY")
                                    </div>
                                </button>
                            </div >
                            {
                                //! THÔNG TIN NGƯỜI LIÊN QUAN
                            }
                            < div className="w-frame wbaseItem-value w-col 76223d88-aa8f-4b10-b851-60108459aeb9" >
                                <div className="w-frame wbaseItem-value w-row e0e0bef6-ce13-410d-b41c-2c7c4d34e61b">
                                    <div className="w-text wbaseItem-value 4c81c3c0-2f05-4065-aebd-2919543763e3">Thông tin người liên quan</div>
                                </div>
                                <div className="w-frame wbaseItem-value w-col a1cbb1f3-f1cb-4843-8b94-46561afae2f2">
                                    <div className="w-text wbaseItem-value 3858e791-6e42-4c9a-8c71-09762ca82cf1">i18("NGUOI_LIEN_HE_TRONG_TRUONG_HOP_THUC_HIEN_NGHIA_VU_THEO_HOP_DONG")</div>
                                    <div className="w-frame wbaseItem-value w-row 5f3fdadb-7755-436a-a4f7-1f4252630538" wrap="wrap">
                                        <TextField
                                            control={control}
                                            keyName="hoTenNguoiLienHe1"
                                            required={true}
                                            type="text"
                                            title=i18("HO_VA_TEN")
                                        placeholder=i18("NHAP_HO_VA_TEN")
                                        style={{ order: 1 }}
                                        register={register}
                                        requiredMessage=i18("VUI_LONG_NHAP_HO_VA_TEN")
                                        errors={errors}
                                        maxLength={80}
                                                    />
                                        <div style={{ order: 2 }} className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md 37b073fc-21eb-4574-a6fe-41de4b232256">
                                            <div className="w-frame wbaseItem-value w-row 00c3c6c3-5f34-4337-a032-d77131863a2b">
                                                <div className="w-text wbaseItem-value 6fe0929f-9291-46eb-bc29-3e44b71a806d">Mối quan hệ<br />
                                                </div>
                                                <div className="w-text wbaseItem-value d3efa0f0-64a3-413c-bed9-380688a47ae6">*</div>
                                            </div>
                                            <Controller
                                                name={"maQhNguoiLienHe1"}
                                                control={control}
                                                {...register(`maQhNguoiLienHe1`)}
                                                style={{ order: 2 }}
                                                rules={{ required: i18("VUI_LONG_CHON_MOI_QUAN_HE") }}
                                                render={({ field }) => (
                                                    <div
                                                        className={`select2-custom ${errors.maQhNguoiLienHe1 && 'helper-text'}`}
                                                        helper-text={errors.maQhNguoiLienHe1 && errors.maQhNguoiLienHe1.message}
                                                        placeholder={i18("CHON_MOI_QUAN_HE")}
                                                    >
                                                        <Select2 {...field}
                                                            data={danhSachQuanHe1?.length > 0 ? danhSachQuanHe1.map((item, index) => { return { name: item.name, id: item?.code ?? index } }) : []}
                                                            options={{ placeholder: i18("CHON_MOI_QUAN_HE") }}
                                                            onChange={(ev) => {
                                                                if (ev.target.value !== "" && ev.target.value != getValues("maQhNguoiLienHe1")) {
                                                                    let selected = danhSachQuanHe1.find((e) => e.code == ev.target.value);
                                                                    setValue("maQhNguoiLienHe1", ev.target.value);
                                                                    setValue("qhNguoiLienHe1", selected.name);
                                                                    clearErrors("maQhNguoiLienHe1");
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            />
                                        </div>
                                        <TextField
                                            control={control}
                                            keyName="dtNguoiLienHe1"
                                            required={true}
                                            type="text"
                                            title=i18("SO_DIEN_THOAI")
                                        placeholder=i18("NHAP_SO_DIEN_THOAI")
                                        style={{ order: 3 }}
                                        register={register}
                                        requiredMessage=i18("VUI_LONG_NHAP_SO_DIEN_THOAI")
                                        errors={errors}
                                        maxLength={10}
                                                    />
                                    </div>
                                </div>
                                {isHaveSpouse ?
                                    <div className="w-frame wbaseItem-value w-col af82fd82-580e-4479-ad04-fffd689c3f45">
                                        <div className="w-text wbaseItem-value 5cc54751-26f3-4a7e-b7a1-f25ed65ae2c6">i18("NGUOI_LIEN_HE_TRONG_TRUONG_HOP_KHAN_CAP")</div>
                                        <div className="w-frame wbaseItem-value w-row 52d35c3f-59dd-4ca7-8cca-5915ce2c147a" wrap="wrap">
                                            <RowInfo title=i18("HO_VA_TEN") text={watch("fullName")} />
                                            <RowInfo title=i18("MOI_QUAN_HE") text="Vợ/Chồng" />
                                            <RowInfo title=i18("SO_DIEN_THOAI") text={watch("phoneNumber")} />
                                        </div>
                                    </div>
                                    :
                                    <div className="w-frame wbaseItem-value w-col af82fd82-580e-4479-ad04-fffd689c3f45">
                                        <div className="w-text wbaseItem-value 5cc54751-26f3-4a7e-b7a1-f25ed65ae2c6">i18("NGUOI_LIEN_HE_TRONG_TRUONG_HOP_KHAN_CAP")</div>
                                        <div className="w-frame wbaseItem-value w-row 52d35c3f-59dd-4ca7-8cca-5915ce2c147a" wrap="wrap">
                                            <TextField
                                                control={control}
                                                keyName="hoTenNguoiLienHe2"
                                                required={true}
                                                type="text"
                                                title=i18("HO_VA_TEN")
                                            placeholder=i18("NHAP_HO_VA_TEN")
                                            style={{ order: 1 }}
                                            register={register}
                                            requiredMessage=i18("VUI_LONG_NHAP_HO_VA_TEN")
                                            errors={errors}
                                            maxLength={80}
                                                        />
                                            <div style={{ order: 2 }} className="w-frame wbaseItem-value w-col col- col6-xxl col6-xl col12-lg col24-md 8773bb39-8dde-42c2-bc21-fbb4288e02ec">
                                                <div className="w-frame wbaseItem-value w-row 1cc82d54-e464-489c-bec0-50f6015442e9">
                                                    <div className="w-text wbaseItem-value 4c42254a-93f5-47ca-a335-ed03fd8173a2">Mối quan hệ<br />
                                                    </div>
                                                    <div className="w-text wbaseItem-value 1cb49746-39fa-42b6-a486-0fe645d85bb7">*</div>
                                                </div>
                                                <Controller
                                                    name={"maQhNguoiLienHe2"} control={control}  {...register(`maQhNguoiLienHe2`)} style={{ order: 2 }} rules={{ required: i18("VUI_LONG_CHON_MOI_QUAN_HE") }}
                                                    render={({ field }) => (
                                                        <div
                                                            className={`select2-custom ${errors.maQhNguoiLienHe2 && 'helper-text'}`}
                                                            helper-text={errors.maQhNguoiLienHe2 && errors.maQhNguoiLienHe2.message}
                                                            placeholder={i18("CHON_MOI_QUAN_HE")}
                                                        >
                                                            <Select2 {...field}
                                                                data={danhSachQuanHe2?.length > 0 ? danhSachQuanHe2.map((item, index) => { return { name: item.name, id: item?.code ?? index } }) : []}
                                                                options={{ placeholder: i18("CHON_MOI_QUAN_HE") }}
                                                                onChange={(ev) => {
                                                                    if (ev.target.value !== "" && ev.target.value != getValues("maQhNguoiLienHe2")) {
                                                                        let selected = danhSachQuanHe2.find((e) => e.code == ev.target.value);
                                                                        setValue("maQhNguoiLienHe2", ev.target.value);
                                                                        setValue("qhNguoiLienHe2", selected.name);
                                                                        clearErrors("maQhNguoiLienHe2");
                                                                    }
                                                                }}
                                                            />
                                                        </div>
                                                    )}
                                                />
                                            </div>
                                            <TextField
                                                control={control}
                                                keyName="dtNguoiLienHe2"
                                                required={true}
                                                type="text"
                                                title=i18("SO_DIEN_THOAI")
                                            placeholder=i18("NHAP_SO_DIEN_THOAI")
                                            style={{ order: 3 }}
                                            register={register}
                                            requiredMessage=i18("VUI_LONG_NHAP_SO_DIEN_THOAI")
                                            errors={errors}
                                            maxLength={10}
                                                        />
                                        </div>
                                    </div>
                                }
                            </div >
                            {/* //! Chứng từ ĐÍNH KÈM */}
                            < div className='w-frame wbaseItem-value w-col ac617f9e-54d0-48ec-9be0-a1e05e9433d8' style={{ width: '100%' }
                            }>
                                <TableAttachDoc
                                    control={control}
                                    getValues={getValues}
                                    setValue={setValue}
                                    errors={errors}
                                    loanProgramItem={listDocument}
                                    watch={watch}
                                    register={register}
                                    setError={setError}
                                    fileHoSo={fileHoSo}
                                    addFileHoSoEvent={addFileHoSoEvent}
                                    removeFileHoSoEvent={removeFileHoSoEvent}
                                />
                            </div >
                            {/* //! Chứng từ ĐÍNH KÈM */}
                            <div className="w-frame wbaseItem-value w-col 513b016d-863b-4c2b-a721-8428c2468af1" level={8} cateid={140}>
                                <div className="w-frame wbaseItem-value w-row 83ba9b55-e4ef-43ce-bca9-165985a9656c" level={9} cateid={140}>
                                    <div className="w-text wbaseItem-value 49ae05f1-d4fa-4999-9b2e-91b1373ed8fc" level={10} cateid={139}>Ghi chú</div>
                                </div>
                                <div className="w-frame wbaseItem-value w-col 1d414740-6ff1-4da6-ae85-8740f651aa4e">
                                    {
                                        settingData?.noteLoanApplication?.length > 0 &&
                                        settingData?.noteLoanApplication.map((item, index) => {
                                            return (
                                                <div key={item.id} className="w-frame wbaseItem-value w-col bdc6abd6-c3bb-4556-bf5c-bef4b6b780a5">
                                                    <div className="w-frame wbaseItem-value w-row 757ba99d-57dc-4959-802e-343dacde166a">
                                                        <div className="w-frame wbaseItem-value w-row 6b9d5d3f-a3a6-4e06-9452-2afef205925d">
                                                            <div className="w-svg wbaseItem-value 4937a4f8-6e6b-4616-b041-8a7916512e86">
                                                                <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M12 2C6.48583 2 2 6.48583 2 12C2 17.5142 6.48583 22 12 22C17.5142 22 22 17.5142 22 12C22 6.48583 17.5142 2 12 2ZM8.66667 10.3333C8.66667 8.4925 10.2033 7 12 7C13.7967 7 15.3333 8.4925 15.3333 10.3333V11.1667C15.3333 13.0075 13.7967 14.5 12 14.5C10.2033 14.5 8.66667 13.0075 8.66667 11.1667V10.3333ZM12 20.3333C9.9725 20.3333 8.1125 19.6033 6.66583 18.395C7.365 17.0758 8.73583 16.1667 10.3333 16.1667H13.6667C15.2642 16.1667 16.635 17.0758 17.3342 18.395C15.8875 19.6033 14.0275 20.3333 12 20.3333Z" fill="#00204D" fillOpacity="0.6" />
                                                                </svg>
                                                            </div>
                                                            <div className="w-text wbaseItem-value 9e3a53ee-5db9-4c54-a1ec-ac08b4c61cea">
                                                                {item.maNguoiTao} - {item.tenNguoiTao}
                                                            </div>
                                                        </div>
                                                        <div className="w-frame wbaseItem-value w-row 4c525dc8-cbbc-4a62-8952-96286db43bc0">
                                                            <div className="w-svg wbaseItem-value ef0e9816-450b-4935-b8af-cc76bfa228b0">
                                                                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M11.8895 3.00065V1.88954C11.8895 1.7422 11.831 1.60089 11.7268 1.4967C11.6226 1.39252 11.4813 1.33398 11.334 1.33398C11.1866 1.33398 11.0453 1.39252 10.9411 1.4967C10.837 1.60089 10.7784 1.7422 10.7784 1.88954V3.00065H11.8895Z" fill="#282829" fillOpacity="0.6" style={{ mixBlendMode: 'multiply' }} />
                                                                    <path d="M5.22287 3.00065V1.88954C5.22287 1.7422 5.16434 1.60089 5.06015 1.4967C4.95597 1.39252 4.81466 1.33398 4.66732 1.33398C4.51998 1.33398 4.37867 1.39252 4.27448 1.4967C4.17029 1.60089 4.11176 1.7422 4.11176 1.88954V3.00065H5.22287Z" fill="#282829" fillOpacity="0.6" style={{ mixBlendMode: 'multiply' }} />
                                                                    <path d="M13.0007 14.1118H3.00065C2.55862 14.1118 2.1347 13.9362 1.82214 13.6236C1.50958 13.311 1.33398 12.8871 1.33398 12.4451V5.22287C1.33398 4.78085 1.50958 4.35692 1.82214 4.04436C2.1347 3.7318 2.55862 3.55621 3.00065 3.55621H13.0007C13.4427 3.55621 13.8666 3.7318 14.1792 4.04436C14.4917 4.35692 14.6673 4.78085 14.6673 5.22287V12.4451C14.6673 12.8871 14.4917 13.311 14.1792 13.6236C13.8666 13.9362 13.4427 14.1118 13.0007 14.1118ZM13.5562 6.33398H2.4451V12.4451C2.4451 12.5924 2.50363 12.7337 2.60781 12.8379C2.712 12.9421 2.85331 13.0007 3.00065 13.0007H13.0007C13.148 13.0007 13.2893 12.9421 13.3935 12.8379C13.4977 12.7337 13.5562 12.5924 13.5562 12.4451V6.33398Z" fill="#282829" fillOpacity="0.6" style={{ mixBlendMode: 'multiply' }} />
                                                                    <path d="M5.77843 7.4451H3.55621V9.11176H5.77843V7.4451Z" fill="#282829" fillOpacity="0.6" />
                                                                    <path d="M9.11176 7.4451H6.88954V9.11176H9.11176V7.4451Z" fill="#282829" fillOpacity="0.6" />
                                                                    <path d="M5.77843 10.2229H3.55621V11.8895H5.77843V10.2229Z" fill="#282829" fillOpacity="0.6" />
                                                                    <path d="M9.11176 10.2229H6.88954V11.8895H9.11176V10.2229Z" fill="#282829" fillOpacity="0.6" />
                                                                    <path d="M12.4451 7.4451H10.2229V9.11176H12.4451V7.4451Z" fill="#282829" fillOpacity="0.6" />
                                                                </svg>
                                                            </div>
                                                            <div className="w-text wbaseItem-value 2e39abc3-d5cb-4ee3-9f61-b86913593d74">
                                                                {item?.createdDate != null ? Ultis.formatDateTime(item.createdDate) : ""}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="w-text wbaseItem-value 25659e4f-248d-4492-9f3f-5bcab0dc70da" style={{ whiteSpace: "pre-line" }}>
                                                        {item.noiDung}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                <div className="w-frame wbaseItem-value w-col f3a66ad9-c326-4e80-b654-b3972e4ad174">
                                    <div style={{ order: 1 }} className="w-text wbaseItem-value 061034cf-a490-44d3-b388-cf3ec090bb51">Thêm ghi chú</div>
                                    <div style={{ order: 2 }} className='custom-note-container'>
                                        <div className='custom-note-title-container'>
                                            {
                                                noteTitleList.map((item) => {
                                                    return <div onClick={() => onClickNote(item)} className='custom-note-option-title'>{item}</div>
                                                })
                                            }
                                        </div>
                                        <textarea
                                            ref={noteRef}
                                            className='note-container'
                                            {...register("saleGhiChuKhoiTaoNhap")}
                                            maxLength={2000}
                                            placeholder=i18("THEM_GHI_CHU")
                                        onChange={(ev) => {
                                            if (ev.target.value && ev.target.value.length > 0) {
                                                setValue("saleGhiChuKhoiTaoNhap", ev.target.value)
                                            }
                                        }}
                                                    />
                                    </div>
                                    <div className="w-frame wbaseItem-value w-row col- col6-xxl col6-xl col12-lg col24-md 511dd007-dc1e-4ce8-8b46-56d2fa88e6dd">
                                        <label
                                            onClick={(ev) => {
                                                let value = !getValues("nghiNgoLuaDao");
                                                setValue("nghiNgoLuaDao", value);
                                            }}
                                            className="w-switch wbaseItem-value d5c8e978-3c3e-48ef-ab36-c240c382c5fc" name-field="Switch" cateid={81}>
                                            <input defaultChecked={watch("nghiNgoLuaDao")} type="checkbox" name="Switch" disabled />
                                            <span className="slider" />
                                        </label>
                                        <div className="w-frame wbaseItem-value w-row 1884c544-8a5d-4204-8dc5-70b8595809ec">
                                            <div className="w-text wbaseItem-value 52548477-596e-40c1-9fb7-939a8c259cd3">*</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
            <div className="w-frame wbaseItem-value w-row 04f360dd-4290-4536-b6d0-d3e0a14f3787" level={3} cateid={140}>
                <button onClick={() => setThoatKhoiTao(true)} type="button" className="w-button wbaseItem-value w-row 18c4f8d4-4bdb-4ebb-a1ac-9467de539973" level={4} cateid={29}>
                    <div className="w-text wbaseItem-value a2600654-48d8-45df-9a0a-1a09ae5197ac" level={5} cateid={139}>i18("THOAT")</div>
                </button>
                <div className="w-frame wbaseItem-value w-row 4b46ec56-fbfc-4ad0-b7bb-addbdfc02a5e">
                    <button onClick={() => {
                        if (checkWorkTime()) return;
                        setHuyKhoiTao(true)
                    }} type="button" className="w-button wbaseItem-value w-row 2d240534-996d-41c3-b929-113232c8beb5">
                        <div className="w-svg wbaseItem-value dc1e7722-4900-4238-9056-139e57b5ff09">
                            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M13.4144 12.0002L20.4144 5.00015L19.0002 3.58594L12.0002 10.5859L5.00015 3.58594L3.58594 5.00015L10.5859 12.0002L3.58594 19.0002L5.00015 20.4144L12.0002 13.4144L19.0002 20.4144L20.4144 19.0002L13.4144 12.0002Z" fill="#28282999" />
                            </svg>
                        </div>
                        <div className="w-text wbaseItem-value cfc011f4-398b-4803-80bf-66cd3cb287b5">Hủy hồ sơ</div>
                    </button>
                    <button type="button" onClick={saveloading !== true ? handleSaveForm : null} className="w-button wbaseItem-value w-row 1ca410af-2283-4f1a-bea8-95b0f251a442">
                        {
                            saveloading === true ?
                                < FontAwesomeIcon icon={faSpinner} spin style={{ color: "#28282999", order: 1 }} />
                                :
                                <div className="w-svg wbaseItem-value fc39e14e-9d67-4c21-9cf3-7ed232e60091">
                                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M18.1665 2H6.49997C5.83694 2 5.20106 2.26339 4.73223 2.73223C4.26339 3.20106 4 3.83694 4 4.49997V21.5831C3.99996 21.6577 4.01993 21.7309 4.05783 21.7951C4.09572 21.8593 4.15015 21.9122 4.21545 21.9482C4.28074 21.9842 4.35449 22.002 4.42902 21.9998C4.50355 21.9976 4.57612 21.9754 4.63916 21.9356L12.3332 17.0765L20.0273 21.9356C20.0938 21.9779 20.171 22.0002 20.2498 21.9998C20.3603 21.9998 20.4663 21.9559 20.5445 21.8777C20.6226 21.7996 20.6665 21.6936 20.6665 21.5831V4.49997C20.6665 3.83694 20.4031 3.20106 19.9343 2.73223C19.4654 2.26339 18.8295 2 18.1665 2V2Z" fill="#28282999" />
                                    </svg>
                                </div>
                        }
                        <div className="w-text wbaseItem-value 1ee79659-30c2-455d-9cb5-6948533eec97">i18("LUU")</div>
                    </button>
                    <button type="submit" className="w-button wbaseItem-value w-row 762e00bc-98c6-46c3-b1dd-f965460e6e94">
                        {
                            sendloading === true ?
                                < FontAwesomeIcon icon={faSpinner} spin style={{ color: "white", order: 1 }} />
                                :
                                <div className="w-svg wbaseItem-value 3280e0d2-079e-4fe9-b00b-3973315514b9">
                                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M21.7337 5.26627C22.0888 5.62129 22.0888 6.19689 21.7337 6.55192L9.91555 18.3701C9.56053 18.7251 8.98493 18.7251 8.6299 18.3701L2.26627 12.0065C1.91124 11.6514 1.91124 11.0758 2.26627 10.7208C2.62129 10.3658 3.19689 10.3658 3.55192 10.7208L9.27273 16.4416L20.4481 5.26627C20.8031 4.91124 21.3787 4.91124 21.7337 5.26627Z" fill="#FFFFFFFF" />
                                    </svg>
                                </div>
                        }
                        <div className="w-text wbaseItem-value c1c90cfc-dd23-4396-9d0a-2d506a1bdf96">i18("GUI")</div>
                    </button>
                </div>
            </div>
                </form >
            </>
            :
<div>
    {isExitTime &&
        <WPopup
            type={PopupType.WARNING}
            title={i18("THOI_GIAN_LAM_VIEC_DA_HET")}
            confirmTitle={'Xác nhận'}
            confirmAction={() => {
                setIsExitTime(false);
                dispatch({ type: 'WORK_TIME', data: {} });
                navigate('/admin/ho-so-cho-xu-ly')
            }}
            cancelAction={() => {
                setIsExitTime(false)
                dispatch({ type: 'WORK_TIME', data: {} });
                navigate('/admin/ho-so-cho-xu-ly')
            }}
            cancelButton={false}
            cancelTitle=''
            message={`Đã hết giờ làm việc, vui lòng thực hiện thao tác trong khoảng thời gian từ ${workTimeStore.startTime} đến ${workTimeStore.endTime}`}
        />
    }
</div>
    )
}

export function PopupDeXuatKhoanVay({ closePopup, settingData, loanProgram, onConfirm }) {
    const notificationDTIAlert = useRef();
    const dispatch = useDispatch();
    const {
        register,
        control,
        setValue,
        getValues,
        watch,
        formState: { errors }
    } = useForm({ shouldFocusError: false });
    const [data, setUpdateData] = useState({});
    const [dataDTI, setUpdateDataDTI] = useState({});

    const handleCloseDTI = (event) => {
        if ($('.popup-overlay').is(event.target) || $('.close-popup').is(event.target)) {
            closePopup();
        }
    }

    const tinhKetQuaDTI = async (_settingData) => {
        const _isHaveSpouse = _settingData?.maritalStatus == "MARRIED";
        const districtCode = _settingData?.currentAddressDistrictCode; // Huyện của khách hàng, hiện tại
        const districtSpouseCode = _settingData?.currentAddressDistrictCodeSpouse; // Mã Huyện người hôn phối đ/c hiện tại
        const interestRate = parseFloat(`${_settingData.laiSuatGiaiDoan2 == null ? _settingData.laiSuatGiaiDoan1 : _settingData.laiSuatGiaiDoan2}`.replace(" %", ""));  //Phần trăm lãi suất
        const maSanPham = _settingData?.maSanPham; // Mã sản phẩm
        const minimumPayment = _settingData?.minimumPayment; // số tiền thanh toán tối thiểu
        const monthlyIncome = convertStringToInt(_settingData?.thuNhapThang); // i18("THU_NHAP_HANG_THANG")
        const monthlyIncomeSpouse = convertStringToInt(_settingData?.monthlyIncome); // i18("THU_NHAP_HANG_THANG") người hôn phối
        const monthlyLivingExpenses = convertStringToInt(_settingData.chiPhiSinhHoatHangThang); // i18("CHI_PHI_SINH_HOAT")
        const monthlyLivingExpensesSpouse = convertStringToInt(_settingData.livingExpenses);// i18("CHI_PHI_SINH_HOAT") người hôn phối
        const monthlyLoanPaymentAtOtherCreditFinance = convertStringToInt(_settingData.tongThanhToanNoVayHangThang ?? 0); // i18("NO_VAY_KHAC")
        const monthlyLoanPaymentSpouseAtOtherCreditFinance = convertStringToInt(_isHaveSpouse ? (_settingData.totalMonthlyLoanPayment ?? 0) : null);
        const numberDependents = _settingData.soNguoiPhuThuoc ?? 0;
        const otherIncome = convertStringToInt(_settingData.thuNhapKhac ?? 0);
        const otherIncomeSpouse = convertStringToInt(_isHaveSpouse ? (_settingData.otherIncome ?? 0) : null);
        const period = convertStringToInt(_settingData.kyHanVay);
        const prepaymentAmount = convertStringToInt(_settingData.soTienTraTruoc);
        const soTienBaoHiem = convertStringToInt(_settingData.soTienBaoHiem);
        const totalSellingPrice = convertStringToInt(_settingData.tongGiaBan);

        const dataBody = {
            districtCode,
            districtSpouseCode, //Hôn phối
            interestRate,
            maSanPham,
            minimumPayment,
            monthlyIncome,
            monthlyIncomeSpouse, //Hôn phối
            monthlyLivingExpenses,
            monthlyLivingExpensesSpouse, //Hôn phối
            monthlyLoanPaymentAtOtherCreditFinance,
            monthlyLoanPaymentSpouseAtOtherCreditFinance, //Hôn phối
            numberDependents,
            otherIncome,
            otherIncomeSpouse, //Hôn phối
            period,
            prepaymentAmount,
            soTienBaoHiem,
            totalSellingPrice
        };

        const arrayValue = Object.entries(dataBody)
            .filter(([key, value]) => value !== null && value !== undefined && value !== "")
            .map(([key, value]) => ({ [key]: value }));

        if ((_isHaveSpouse && arrayValue.length == 18) || (!_isHaveSpouse && arrayValue.length == 13)) {
            const res = await DTIDA.tinhDTI_V2(dataBody);
            if (res.code === "200") {
                let _dataDTI = {
                    promotionCode: getValues("promotionCode"),
                    soTienTraTruoc: Ultis.tryParseFloat(getValues("soTienTraTruoc")),
                    soTienVayGoc: res.data.principalLoanAmount,
                    diemDTI: res.data.dtiInitialNew.point?.toFixed(2),
                    ketQuaDTI: res.data.dtiResult,
                    kyHanVay: getValues("kyHanVay") ?? _settingData.kyHanVay,
                    laiSuatGiaiDoan1: getValues("laiSuatGiaiDoan1") ?? _settingData.laiSuatGiaiDoan1,
                    kyHanGiaiDoan1: getValues("kyHanGiaiDoan1") ?? _settingData.kyHanGiaiDoan1,
                    laiSuatGiaiDoan2: getValues("laiSuatGiaiDoan2") ?? _settingData.laiSuatGiaiDoan2,
                    kyHanGiaiDoan2: getValues("kyHanGiaiDoan2") ?? _settingData.kyHanGiaiDoan2,
                    tyLeTraTruoc: (Ultis.tryParseFloat(`${getValues("soTienTraTruoc")}`.replaceAll(",", "")) / _settingData.tongGiaBan * 100).toFixed(0),
                    suggestedMonthlyPayment: res.data.totalSuggestedMonthlyPaymentAtJIVF,
                }
                setUpdateDataDTI(_dataDTI);
            } else {
                dispatch({ type: SET_MESSAGE, title: res.message });
            }
        }
    }

    const getLSgiaiDoan1 = (listItem, promotionCode) => {
        let output = listItem.find((e) => e.promotionCode === promotionCode && e.udeId === "INTEREST_RATE");
        return output?.udeValue ?? 0
    }

    const soTienTraTruoc = watch("soTienTraTruoc");
    const maxPaymentLoan = Ultis.tryParseFloat(`${(data.tongGiaBan - loanProgram.data.minimumLoanAmount).toFixed(0)}`.replaceAll(".00", ""))
    const minPaymentLoan = Ultis.tryParseFloat(`${(data.tongGiaBan * loanProgram.data.minimumPrepaymentPercent / 100).toFixed(0)}`.replaceAll(".00", ""))

    useEffect(() => {
        setUpdateData(settingData);
        setValue("kyHanVay", settingData.kyHanVay);
        setValue("promotionCode", settingData.promotionCode);
        setValue("laiSuatGiaiDoan1", settingData.laiSuatGiaiDoan1);
        setValue("laiSuatGiaiDoan2", settingData.laiSuatGiaiDoan2);
        setValue("kyHanGiaiDoan1", settingData.kyHanGiaiDoan1);
        setValue("kyHanGiaiDoan2", settingData.kyHanGiaiDoan2);
        setValue("soTienTraTruoc", parseFloat(`${settingData.soTienTraTruoc}`.replaceAll(",", "")));
    }, []);

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <NotificationAlert ref={notificationDTIAlert} />
            <div onClick={handleCloseDTI} className="popup-overlay" >
                <div className="w-frame wbaseItem-value w-col min-brp 6206c029-e8f3-492b-9a0e-6300ab372209 no-trans">
                    <div className="w-frame wbaseItem-value w-row f2a252a3-beaa-4a0e-b570-27e94543010b">
                        <div className="w-text wbaseItem-value dfd9671a-9572-4baf-be4e-cb50a3567528">i18("GIA_DINH_KET_QUA_DTI")</div>
                        <div onClick={handleCloseDTI} className="close-popup nav-link w-svg wbaseItem-value 409238e9-a34f-481e-892f-b59a27643794">
                            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ pointerEvents: "none" }}>
                                <path d="M13.4144 12.0002L20.4144 5.00015L19.0002 3.58594L12.0002 10.5859L5.00015 3.58594L3.58594 5.00015L10.5859 12.0002L3.58594 19.0002L5.00015 20.4144L12.0002 13.4144L19.0002 20.4144L20.4144 19.0002L13.4144 12.0002Z" fill="#28282999" />
                            </svg>
                        </div>
                    </div>
                    <div className="w-frame wbaseItem-value w-col 28dc50ae-df83-4604-a493-15b966a8afd6">
                        <div className="w-frame wbaseItem-value w-col da98feb3-5798-4b3f-b943-e884eea281d2">
                            <div className="w-frame wbaseItem-value w-row 86b65fae-5aa8-48cc-877f-23d0080683cc">
                                <div className="w-text wbaseItem-value f6069550-163e-476b-b5fd-d934f93bcb5a">i18("DIEM_DTI_HIEN_TAI"):</div>
                                <div className="w-text wbaseItem-value c8163621-34fe-4111-a6ec-dd44561af741">{data.diemDTI ?? "-"}</div>
                            </div>
                            <div className="w-frame wbaseItem-value w-row 9291bca5-8a45-4345-becb-6e9bff82682a">
                                <div className="w-text wbaseItem-value 28d461ae-800d-462f-b9b3-4b77e1be25cd">i18("SO_TIEN_VAY_GOC"):</div>
                                <div className="w-text wbaseItem-value 8d6f2f08-0f3f-4c65-9cca-566c04baa23a">{Ultis.money(data.soTienVayGoc)} VND</div>
                            </div>
                            <div className="w-frame wbaseItem-value w-row 7b2d9a3f-8b67-4dd8-87cd-b6e5eb4a92e9">
                                <div className="w-text wbaseItem-value 3a37c806-4af7-4534-aa47-f6014ec7b0b6">i18("SO_TIEN_TRA_TRUOC"):</div>
                                <div className={"w-textformfield wbaseItem-value w-row 1553307f-fd10-4679-a62d-9b2d1584a217 "}
                                    name-field="RoleID" placeholder=i18("NHAP_SO_TIEN")
                                >
                                <div className="wbaseItem-value ee5c5ee0-f72f-480e-9462-53f6362a2d1f" name-field="Textfield"
                                    cateid={86}>
                                    <div className="textfield">
                                        <input
                                            autoComplete='false'
                                            {...register("soTienTraTruoc")}
                                            maxLength="19"
                                            placeholder=i18("NHAP_SO_TIEN")
                                        value={watch("soTienTraTruoc") != null && watch("soTienTraTruoc") !== "" ? `${watch("soTienTraTruoc")}`?.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,") : ""}
                                        onChange={(ev) => {
                                            if (Ultis.isValid(ev.target.value.replace(/[^0-9.]/g, ""), 14, 2)) {
                                                setValue("soTienTraTruoc", ev.target.value.replace(/[^0-9.]/g, ""));
                                            }
                                        }}
                                        onBlur={(ev) => {
                                            if (Ultis.tryParseFloat(ev.target.value) > maxPaymentLoan) {
                                                setValue('soTienTraTruoc', Ultis.money(maxPaymentLoan))
                                            }
                                            if (Ultis.tryParseFloat(ev.target.value) < minPaymentLoan) {
                                                setValue('soTienTraTruoc', Ultis.money(minPaymentLoan))
                                            }
                                            tinhKetQuaDTI(data, false)
                                        }}
                                            />
                                    </div>
                                </div>
                                <div class="w-text wbaseItem-value 672c0e54-75e0-45cb-b5c0-f912b0deadde" level="12" cateid="139"> VND </div>
                            </div>
                        </div>
                        <div className="slider-container 0205b5b3-ee73-472c-909b-35151cc83b15" style={{ order: 3 }}>
                            <div className='gia-tri-dau-cuoi-slide'>
                                <div className='gia-tri-dau-slide'>{Ultis.money(`${minPaymentLoan}`)}</div>
                                <div className='gia-tri-cuoi-slide'>{Ultis.money(`${maxPaymentLoan}`)} VND</div>
                            </div>
                            <input
                                type="range"
                                min={minPaymentLoan}
                                max={maxPaymentLoan}
                                value={parseFloat(`${soTienTraTruoc}`.replaceAll(",", ""))}
                                onChange={(ev) => {
                                    setValue('soTienTraTruoc', Ultis.money(ev.target.value.replaceAll(",", "")))
                                }}
                                onMouseUp={() => tinhKetQuaDTI(data, true)}
                                name='soTienTraTruoc'
                                className="range-slider"
                                style={{ marginTop: 24, '--value': `${((parseFloat(`${soTienTraTruoc}`.replaceAll(",", "")) - minPaymentLoan) / ((data.tongGiaBan - loanProgram.data.minimumLoanAmount) - minPaymentLoan) * 100).toFixed(2)}%` }}
                            />
                        </div>

                        <div style={{ marginTop: 24 }} className="w-frame wbaseItem-value w-row af0d7f3b-4b02-4eef-99eb-159c5ebe2cd5">
                            <div className="w-text wbaseItem-value b0ec134c-1eed-44c6-b3a3-4a3af55c878d">i18("KY_HAN"):</div>
                            <div style={{ border: "none" }} className={"w-textformfield wbaseItem-value w-row 1553307f-fd10-4679-a62d-9b2d1584a217 "}
                                name-field="RoleID" placeholder=i18("NHAP_KY_HAN")
                                >
                            <Controller
                                name={"promotionCode"} control={control}  {...register(`promotionCode`)} style={{ order: 2 }} rules={{ required: i18("VUI_LONG_CHON_KY_HAN_VAY") }}
                                render={({ field }) => (
                                    <div
                                        className={`select2-custom ${errors.promotionCode && 'helper-text'}`}
                                        helper-text={errors.promotionCode && errors.promotionCode.message}
                                        placeholder={i18("CHON_KY_HAN_VAY")}
                                    >
                                        <Select2 {...field}
                                            data={loanProgram.facilityMas.map((item, _) => { return { name: `${item.stdTenor} tháng`, id: item.promotionCode } }) ?? []}
                                            options={{ placeholder: i18("CHON_KY_HAN_VAY") }}
                                            onChange={(ev) => {
                                                if (ev.target.value !== "" && ev.target.value != getValues("promotionCode")) {
                                                    setValue('promotionCode', ev.target.value);
                                                    settingData.promotionCode = ev.target.value;
                                                    const selected = loanProgram.facilityMas.find((e) => e.promotionCode == ev.target.value);
                                                    setValue('kyHanVay', selected.stdTenor)
                                                    setValue('kyHanGiaiDoan1', selected.modNo === 1 ? selected.stdTenor : selected.fixedPeriod ?? "")
                                                    setValue('laiSuatGiaiDoan1', selected.modNo === 1 ? getLSgiaiDoan1(loanProgram.facilityDets, ev.target.value) : selected.fixedRate ?? "")
                                                    setValue('kyHanGiaiDoan2', selected.modNo === 1 ? null : selected.stdTenor - selected.fixedPeriod)
                                                    setValue('laiSuatGiaiDoan2', selected.modNo === 1 ? null : selected.intrateRatecode)
                                                    tinhKetQuaDTI(data, false);
                                                }
                                            }}
                                        />
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                    <div className="w-frame wbaseItem-value w-row 3d698c35-288c-452b-806b-70d86e841819">
                        <div className="w-text wbaseItem-value d82411c2-7c3c-49ca-95df-4fb32b097346">i18("DIEM_DTI_MOI"):</div>
                        <div className="w-text wbaseItem-value d0690d82-3a8a-4ba3-a5d6-6e5ca6be83b0">{dataDTI.diemDTI}</div>
                    </div>
                    <div className="w-frame wbaseItem-value w-row a5e8413b-6a64-481b-8246-25cf5d3dd602">
                        <div className="w-text wbaseItem-value af99afaa-925d-4235-b2b8-7aac1b3dbe8c">i18("KET_QUA_DTI_MOI"):</div>
                        {dataDTI.ketQuaDTI != null &&
                            <div className={`w-text wbaseItem-value 22b2604d-4118-4b54-8269-1eed36574c39 ${dataDTI.ketQuaDTI == "Đạt" ? "pass" : "fail"}`}>{dataDTI.ketQuaDTI === "Đạt" ? "Pass" : "Fail"}</div>
                        }
                    </div>
                </div>
            </div>
            <div className="w-frame wbaseItem-value w-row 536606fe-364d-4f28-9e3a-b4080a654e1c">
                <div onClick={handleCloseDTI} className="close-popup nav-link w-frame wbaseItem-value w-row fa519bd8-bb32-4569-9579-64f7a03de7ba">
                    <div className="w-text wbaseItem-value 1816daf4-efe8-4800-9eaa-b99ac6fb7fa6" style={{ pointerEvents: "none" }}>i18("THOAT")</div>
                </div>
                <div className="w-frame wbaseItem-value w-row 41d8ea0f-6e8e-41be-98e6-f6009abcff04">
                    <button
                        onClick={
                            dataDTI.diemDTI ? () => {
                                onConfirm(dataDTI)
                            } : null
                        }
                        style={{ backgroundColor: dataDTI.diemDTI ? "green" : "#DFDFDF" }}
                        type="button" className="w-button wbaseItem-value w-row 165d3fb4-0b5b-4a04-9168-829470745e2c">
                        <div className="w-text wbaseItem-value d21811e2-9864-46e2-a2ca-cb9a36aa4f29">i18("AP_DUNG")</div>
                    </button>
                </div>
            </div>
        </div>
            </div >
        </div >
    )
}
import * as React from "react";
import { Container, Content, List, Header, Title, Button, Spinner } from "native-base";
import { Linking, Modal, View, Text } from "react-native";
import { createStackNavigator, createAppContainer } from "react-navigation";
import { styles } from "../styles";
import { takeUrl } from "../utils/uploadFileFromCryptoArmDoc";
import * as url from "url";

import { ListMenu } from "../components/ListMenu";
import { Headers } from "../components/Headers";
import { ListCertCategory } from "./ListCertCategory";
import { PropertiesCert } from "./PropertiesCert";
import { SelectPersonalСert } from "./SelectPersonalСert";
import { ExportCert } from "./ExportCert";
import { CreateCertificate } from "./CreateCertificate";
import { Signature } from "./Signature";
import { Encryption } from "./Encryption";
import { Certificate } from "./Certificate";
import { Journal } from "./Journal";
import { SelectCert } from "./SelectCert";
import { Containers } from "./Containers";
import { Documents } from "./Documents";
import { Requests } from "./Requests";
import { AboutSignCert } from "./AboutSignCert";
import { NotSelectedDocuments } from "./NotSelectedDocuments";
import { FilterJournal } from "./FilterJournal";
import { AboutAllSignCert } from "./AboutAllSignCert";
import { License } from "./License";
import { SignForCryptoArmDoc } from "./SignForCryptoArmDoc";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getProviders } from "../actions/getContainersAction";
import { readCertKeys } from "../actions/certKeysAction";
import { readFiles, checkFiles } from "../actions";
import { readRequests } from "../actions/requestAction";
import { refreshStatusLicense } from "../actions/refreshStatusAction";
import { addTempFilesForCryptoarmdDocuments } from "../actions/uploadFileToCryptoArmDocumtsAction";
import { clearTempFiles } from "../actions/uploadFileToCryptoArmDocumtsAction";
import { clearAllFilesinWorkspaceSign } from "../actions/workspaceAction";

function mapStateToProps(state) {
	return {
		workspaceEnc: state.workspaceEnc.files,
		workspaceSign: state.workspaceSign.files,
		certificates: state.certificates.certificates,
		files: state.files.files,
		lastlog: state.logger.lastlog,
		containers: state.containers.containers,
		loadContainers: state.containers.loader,
		statusLicense: state.statusLicense.status,
		tempFiles: state.tempFiles.tempFiles
	};
}

function mapDispatchToProps(dispatch) {
	return {
		readFiles: bindActionCreators(readFiles, dispatch),
		readCertKeys: bindActionCreators(readCertKeys, dispatch),
		getProviders: bindActionCreators(getProviders, dispatch),
		readRequests: bindActionCreators(readRequests, dispatch),
		refreshStatusLicense: bindActionCreators(refreshStatusLicense, dispatch),
		addTempFilesForCryptoarmdDocuments: bindActionCreators(addTempFilesForCryptoarmdDocuments, dispatch),
		checkFiles: bindActionCreators(checkFiles, dispatch),
		clearTempFiles: bindActionCreators(clearTempFiles, dispatch),
		clearAllFilesinWorkspaceSign: bindActionCreators(clearAllFilesinWorkspaceSign, dispatch)
	};
}

interface MainProps {
	navigation: any;
	files: any;
	certificates: any;
	containers: any;
	loadContainers: boolean;
	lastlog: any;
	workspaceEnc: any;
	workspaceSign: any;
	statusLicense: any;
	tempFiles: object;
	readCertKeys(): any;
	readFiles(): any;
	getProviders(): any;
	readRequests(): any;
	refreshStatusLicense(): any;
	addTempFilesForCryptoarmdDocuments(name: string, id: number, uploadurl: string, href: string): void;
	clearTempFiles(): void;
	clearAllFilesinWorkspaceSign(): void;
	checkFiles(uri: string, fileName: string, workspace: string): void;
}

interface MainState {
	modalWarning: boolean;
	url: string;
	href: string;
	loader: boolean;
}

const options = {
	year: "numeric", month: "numeric", day: "numeric",
};

@(connect(mapStateToProps, mapDispatchToProps) as any)
class Main extends React.Component<MainProps, MainState> {

	state = {
		modalWarning: false,
		url: null,
		href: null,
		loader: false
	};

	setModalVisible(visible) {
		this.setState({ modalWarning: visible });
	}

	componentWillUnmount() {
		Linking.removeEventListener("url", this._handleOpenURL);
	}

	_handleOpenURL = (event) => {
		let param = url.parse(event.url, true);
		this.setState({ modalWarning: true, url: event.url, href: param.query.href });
	}

	componentDidMount() {
		Linking.addEventListener("url", this._handleOpenURL);
		this.props.readFiles();
		this.props.readCertKeys();
		this.props.getProviders();
		this.props.readRequests();
		this.props.refreshStatusLicense();
		this.props.clearTempFiles();
		// window.open("cryptoarmgost://" + "?id=" + ids + "?url=" + JSON.parse(d.docsToSign)[0].url + "?filename=" + JSON.parse(d.docsToSign)[0].name + "?uploadurl=" + AJAX_CONTROLLER + '?command=upload');

		Linking.getInitialURL().then((url_string) => {
			if (url_string) {
				let param = url.parse(url_string, true);
				this.setState({ modalWarning: true, href: param.query.href, url: url_string });
			}
		}).catch(err => console.error("An error occurred", err));
	}

	render() {
		const { navigate } = this.props.navigation;
		const { files, certificates, lastlog, containers, workspaceSign, workspaceEnc } = this.props;
		let length = "всего файлов: " + files.length;
		let lengthSign = "выбрано файлов: " + workspaceSign.length;
		let lengthEnc = "выбрано файлов: " + workspaceEnc.length;
		let persCert = "личных сертификатов: " + certificates.filter(cert => cert.category.toUpperCase() === "MY").length;
		let lengthContainers;
		if (this.props.loadContainers) {
			lengthContainers = "считывание контейнеров";
		} else {
			lengthContainers = "количество контейнеров: " + containers.length;
		}
		let lastlognote = lastlog ? "последняя запись: " + new Date(lastlog).toLocaleString("ru", options) : "действий не совершалось";

		let loader = null;
		if (this.state.loader) {
			loader = <View style={styles.loader}>
				<View style={styles.loaderView}>
					<Spinner color={"#be3817"} />
					<Text style={{ fontSize: 17, color: "grey" }}>Операция{"\n"}выполняется</Text>
				</View>
			</View>;
		}
		return (
			<>
				<Container style={styles.container}>
					<Headers title="КриптоАРМ ГОСТ" />
					<Content>
						<List>
							<ListMenu title="Документы" img={require("../../imgs/general/documents_main_icon.png")}
								note={length} nav={() => navigate("Documents")} />
							<ListMenu title="Подпись" img={require("../../imgs/general/sign_main_icon.png")}
								note={lengthSign} nav={() => navigate("Signature", { name: "Signature" })} />
							<ListMenu title="Шифрование" img={require("../../imgs/general/encode_main_icon.png")}
								note={lengthEnc} nav={() => navigate("Encryption", { name: "Encryption" })} />
							<ListMenu title="Управление сертификатами" img={require("../../imgs/general/certificates_main_icon.png")}
								note={persCert} nav={() => navigate("Certificate", { name: "Certificate" })} />
							<ListMenu title="Управление контейнерами" img={require("../../imgs/general/stores_main_icon.png")}
								note={lengthContainers} nav={() => navigate("Containers", { name: "Containers" })} />
							<ListMenu title="Журнал операций" img={require("../../imgs/general/journal_main_icon.png")}
								note={lastlognote} nav={() => navigate("Journal")} />
							<ListMenu title="Лицензии" img={require("../../imgs/general/license_menu_icon.png")}
								note={this.props.statusLicense ? "действительные" : "ошибка при проверке"} nav={() => navigate("License")} />
						</List>
						<Modal
							animationType="none"
							transparent
							visible={this.state.modalWarning}>
							<View style={{
								flex: 1,
								flexDirection: "column",
								justifyContent: "center",
								alignItems: "center",
								backgroundColor: "rgba(0, 0, 0, 0.5)"
							}}>
								<View style={styles.modal}>
									<Header
										style={{ backgroundColor: "#be3817", height: 45.7, paddingTop: 13 }}>
										<Title>
											<Text style={{
												color: "white",
												fontSize: 15
											}}>Подтверждение операции</Text>
										</Title>
									</Header>
									<Text style={{ fontSize: 17, padding: 5 }}>Сторонний ресурс запрашивает разрешение на выполнении операции в приложении.{"\n"}Разрешить?</Text>
									<View style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", justifyContent: "space-around", maxWidth: "100%" }}>
										<Button transparent
											style={styles.modalMain}
											onPress={() => {
												this.setState({ modalWarning: false });
												if (/chrome/.test(this.state.url)) {
													Linking.openURL("googlechrome://");
												} else {
													Linking.openURL(this.state.href);
												}
											}}>
											<Text style={styles.buttonModal}>Нет</Text>
										</Button>
										<Button transparent
											style={styles.modalMain}
											onPress={() => {
												this.setState({ modalWarning: false });
												takeUrl(this.state.url, this.props.addTempFilesForCryptoarmdDocuments, this.props.checkFiles, this.props.navigation.navigate, this.props.clearAllFilesinWorkspaceSign, (status) => this.setState({ loader: status }));
											}}>
											<Text style={styles.buttonModal}>Да</Text>
										</Button>
									</View>
								</View>
							</View>
						</Modal>
					</Content>
				</Container>
				{loader}
			</>
		);
	}
}

const AppNavigator = createStackNavigator({
	Main: { screen: Main },
	Signature: {
		screen: Signature,
		path: "sign",
	},
	Encryption: { screen: Encryption },
	Certificate: { screen: Certificate },
	Journal: { screen: Journal },
	ListCertCategory: { screen: ListCertCategory },
	PropertiesCert: { screen: PropertiesCert },
	SelectPersonalСert: { screen: SelectPersonalСert },
	CreateCertificate: { screen: CreateCertificate },
	ExportCert: { screen: ExportCert },
	SelectCert: { screen: SelectCert },
	Containers: { screen: Containers },
	Documents: { screen: Documents },
	Requests: { screen: Requests },
	AboutSignCert: { screen: AboutSignCert },
	NotSelectedDocuments: { screen: NotSelectedDocuments },
	FilterJournal: { screen: FilterJournal },
	SignForCryptoArmDoc: { screen: SignForCryptoArmDoc },
	AboutAllSignCert: {
		screen: AboutAllSignCert,
		path: "verify"
	},
	License: { screen: License },
}, {
		defaultNavigationOptions: {
			gesturesEnabled: false,
			header: null
		}
	});


export const App = createAppContainer(AppNavigator);

/* NativeModules.Wrap_Main.connect(RNFS.DocumentDirectoryPath, (veify, err) => {
			RNFS.readDir("/var/mobile/Library/Mobile Documents/iCloud~com~digt~CryptoARMGOST/Documents/").then(
				fileForCloud => {
					console.log(fileForCloud);
					for (let i = 0; i < fileForCloud.length; i++) {
						if (fileForCloud[i].name.indexOf(".icloud") !== -1) {
							NativeModules.Wrap_Main.downloadingFileFromiCloud(fileForCloud[i].path, (veify, err) => {
								RNFS.readDir("/var/mobile/Library/Mobile Documents/iCloud~com~digt~CryptoARMGOST/Documents/").then(
									newFileForCloud => console.log(newFileForCloud)
								);
								let correctName = fileForCloud[i].name;
								correctName = correctName.replace(".icloud", "");
								correctName = correctName.slice(1);
								debugger;
								RNFS.copyFile("/var/mobile/Library/Mobile Documents/iCloud~com~digt~CryptoARMGOST/Documents/" + correctName, RNFS.DocumentDirectoryPath + "/Files/" + correctName).then(
									this.props.readFiles()
								);
							});
						} else if (fileForCloud[i].name[0] === ".") {
							continue;
						} else {
							RNFS.copyFile("/var/mobile/Library/Mobile Documents/iCloud~com~digt~CryptoARMGOST/Documents/" + fileForCloud[i].name, RNFS.DocumentDirectoryPath + "/Files/" + fileForCloud[i].name).then(
								success => {
									this.props.readFiles();
								},
								err => {
									RNFS.unlink(RNFS.DocumentDirectoryPath + "/Files/" + fileForCloud[i].name).then(
										() => RNFS.copyFile("/var/mobile/Library/Mobile Documents/iCloud~com~digt~CryptoARMGOST/Documents/" + fileForCloud[i].name, RNFS.DocumentDirectoryPath + "/Files/" + fileForCloud[i].name).then(
											() => {
												this.props.readFiles();
											}
										)
									);
								}
							);
						}
					}
					RNFS.readDir(RNFS.DocumentDirectoryPath + "/Files/").then(
						fileForApps => {
							console.log(fileForApps);
							for (let i = 0; i < fileForApps.length; i++) {
								if (fileForApps[i].name[0] === ".") {
									continue;
								}
								console.log(fileForApps[i]);
								RNFS.copyFile(fileForApps[i].path, "/var/mobile/Library/Mobile Documents/iCloud~com~digt~CryptoARMGOST/Documents/" + fileForApps[i].name).catch(
									err => console.log(err.message)
								);
							}
						}
					);
				},
				err => console.log(err)
			);
		}); */

/*RNFS.readDir("/var/mobile/Library/Mobile Documents/iCloud~com~digt~CryptoARMGOST/Documents/").then(
						fileForCloud => {
							console.log(fileForCloud);
							for (let i = 0; i < fileForCloud.length; i++) {
								if (fileForCloud[i].name[0] === ".") {
									continue;
								}
								RNFS.copyFile("/var/mobile/Library/Mobile Documents/iCloud~com~digt~CryptoARMGOST/Documents/" + fileForCloud[i].name, RNFS.DocumentDirectoryPath + "/Files/" + fileForCloud[i].name).then().catch(
									() => {
										RNFS.unlink(RNFS.DocumentDirectoryPath + "/Files/" + fileForCloud[i].name).then(
											() => RNFS.copyFile("/var/mobile/Library/Mobile Documents/iCloud~com~digt~CryptoARMGOST/Documents/" + fileForCloud[i].name, RNFS.DocumentDirectoryPath + "/Files/" + fileForCloud[i].name)
										);
									}
								);*/
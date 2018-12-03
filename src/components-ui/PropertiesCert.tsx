import * as React from "react";
import { Container, ListItem, View, List, Content, Segment, Button, Text, Footer, FooterTab, Header, Title, Left, Right, Icon, Spinner } from "native-base";
import { Image, AlertIOS, NativeModules, Alert } from "react-native";
import { Headers } from "../components/Headers";
import { styles } from "../styles";
import { FooterButton } from "../components/FooterButton";
import { ListForCert } from "../components/ListForCert";
import { showToast } from "../utils/toast";
import { ListMenu } from "../components/ListMenu";
import * as Modal from "react-native-modalbox";

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { readCertKeys } from "../actions/certKeysAction";
import { deleteCertAction } from "../actions/deleteCertAction";

function mapDispatchToProps(dispatch) {
	return {
		readCertKeys: bindActionCreators(readCertKeys, dispatch),
		deleteCertAction: bindActionCreators(deleteCertAction, dispatch)
	};
}

interface PropertiesCertState {
	numPage: number;
	chain: any;
	loader: boolean;
}

interface PropertiesCertProps {
	navigation: any;
	cert: string;
	readCertKeys(): void;
	deleteCertAction(cert, withContainers, goBack): void;
}

interface IModals {
	basicModal: Modal.default;
}

@(connect(null, mapDispatchToProps) as any)
export class PropertiesCert extends React.Component<PropertiesCertProps, PropertiesCertState> {

	private modals: IModals = {
		basicModal: null
	};

	constructor(props) {
		super(props);

		this.state = {
			numPage: 1,
			chain: [],
			loader: false
		};
	}

	deleteCert() {
		const { cert } = this.props.navigation.state.params;
		const { goBack } = this.props.navigation;
		const { deleteCertAction } = this.props;
		if (cert.hasPrivateKey) {
			AlertIOS.alert(
				"Удалить сертификат '" + cert.subjectFriendlyName + "' с контейнером?",
				null,
				[{
					text: "Да", onPress: () => deleteCertAction(cert, true, goBack())
				}, {
					text: "Нет", onPress: () => deleteCertAction(cert, false, goBack())
				}, {
					text: "Отмена", onPress: () => null, style: "cancel"
				}]
			);
		} else {
			AlertIOS.alert(
				"Удалить сертификат?",
				null,
				[{
					text: "Да", onPress: () => deleteCertAction(cert, false, goBack())
				}, {
					text: "Отмена", onPress: () => null, style: "cancel"
				}]
			);
		}
	}

	chainList() {
		return (
			this.state.chain.map((chain, key, arr) =>
				<List key={key} style={{ paddingTop: 10 }}>
					<ListMenu
						numChain={key}
						lengthChain={arr.length}
						title={chain.subjectName.match(/2.5.4.3=[^\/]{1,}/)[0].replace("2.5.4.3=", "")}
						img={this.props.navigation.state.params.cert.chainBuilding ? require("../../imgs/general/cert_ok_icon.png") : require("../../imgs/general/cert_bad_icon.png")}
						note={chain.subjectName.match(/2.5.4.10=[^\/]{1,}/) ? chain.subjectName.match(/2.5.4.10=[^\/]{1,}/)[0].replace("2.5.4.10=", "") : null} nav={() => null} />
				</List>
			)
		);
	}

	render() {
		const { cert, isCertInContainers, containers } = this.props.navigation.state.params;
		const { navigate, goBack } = this.props.navigation;
		let subjectFriendlyName, subjectEmail, subjectCountry, subjectRegion, subjectCity;
		let loader = null;
		if (this.state.loader) {
			loader = <View style={styles.loader}>
				<View style={styles.loaderView}>
					<Spinner color={"#be3817"} />
					<Text style={{ fontSize: 17, color: "grey" }}>Операция{"\n"}выполняется</Text>
				</View>
			</View>;
		}
		if (!cert.selfSigned) {
			subjectFriendlyName = cert.subjectName.match(/2.5.4.3=[^\/]{1,}/);
			subjectFriendlyName = subjectFriendlyName ? subjectFriendlyName[0].replace("2.5.4.3=", "") : null;

			subjectEmail = cert.subjectName.match(/1.2.840.113549.1.9.1=[^\/]{1,}/);
			subjectEmail = subjectEmail ? subjectEmail[0].replace("1.2.840.113549.1.9.1=", "") : null;

			subjectCountry = cert.subjectName.match(/2.5.4.6=[^\/]{1,}/);
			subjectCountry = subjectCountry ? subjectCountry[0].replace("2.5.4.6=", "") : null;

			subjectRegion = cert.subjectName.match(/2.5.4.8=[^\/]{1,}/);
			subjectRegion = subjectRegion ? subjectRegion[0].replace("2.5.4.8=", "") : null;

			subjectCity = cert.subjectName.match(/2.5.4.7=[^\/]{1,}/);
			subjectCity = subjectCity ? subjectCity[0].replace("2.5.4.7=", "") : null;
		}
		let issuerEmail = cert.issuerName.match(/1.2.840.113549.1.9.1=[^\/]{1,}/);
		issuerEmail = issuerEmail ? issuerEmail[0].replace("1.2.840.113549.1.9.1=", "") : null;
		let issuerCountry = cert.issuerName.match(/2.5.4.6=[^\/]{1,}/);
		issuerCountry = issuerCountry ? issuerCountry[0].replace("2.5.4.6=", "") : null;
		let issuerRegion = cert.issuerName.match(/2.5.4.8=[^\/]{1,}/);
		issuerRegion = issuerRegion ? issuerRegion[0].replace("2.5.4.8=", "") : null;
		let issuerCity = cert.issuerName.match(/2.5.4.7=[^\/]{1,}/);
		issuerCity = issuerCity ? issuerCity[0].replace("2.5.4.7=", "") : null;
		let organizationName = cert.issuerName.match(/2.5.4.10=[^\/]{1,}/);
		organizationName = organizationName ? organizationName[0].replace("2.5.4.10=", "") : null;
		return (
			<Container style={styles.container}>
				<Headers title="Свойства сертфиката" goBack={() => goBack()} goHome={() => this.props.navigation.goBack("Home")} />
				{isCertInContainers ? null : <Segment style={{ backgroundColor: "white" }}>
					<Button first style={[{ width: "48%", borderColor: "grey" }, this.state.numPage === 1 ? { backgroundColor: "lightgrey" } : null]}
						active={this.state.numPage === 1 ? true : false} onPressIn={() => this.setState({ numPage: 1 })}>
						<Text style={{ color: "black" }}>Сертификат</Text>
					</Button>
					<Button last style={[{ width: "48%", borderColor: "grey" }, this.state.numPage === 2 ? { backgroundColor: "lightgrey" } : null]}
						active={this.state.numPage === 2 ? true : false} onPressIn={() => this.setState({ numPage: 2 })}>
						<Text style={{ color: "black" }}>Цепочка доверия</Text>
					</Button>
				</Segment>}
				{this.state.numPage === 1
					? <>
					<Content style={{ backgroundColor: "white" }}>
						<View>
							<Image style={styles.prop_cert_img} source={isCertInContainers ? require("../../imgs/general/cert_ok_icon.png") : cert.chainBuilding ? require("../../imgs/general/cert_ok_icon.png") : require("../../imgs/general/cert_bad_icon.png")} />
							<Text style={styles.prop_cert_title}>{cert.subjectFriendlyName}</Text>
							{isCertInContainers ? null : <Text style={styles.prop_cert_status}>Cтатус сертификата:{"\n"}
								{cert.chainBuilding ? <Text style={{ color: "green" }}>действителен</Text> : <Text style={{ color: "red" }}>не действителен</Text>}
							</Text>}
						</View>
						<List>
							{cert.selfSigned ? null : <>
								<ListForCert itemHeader first title="Владелец" />
								<ListForCert title="Имя:" value={subjectFriendlyName} />
								{subjectEmail ? <ListForCert title="Email:" value={subjectEmail} /> : null}
								{cert.organizationName ? <ListForCert title="Огранизация:" value={cert.organizationName} /> : null}
								{subjectCountry ? <ListForCert title="Страна:" value={subjectCountry} /> : null}
								{subjectRegion ? <ListForCert title="Регион:" value={subjectRegion} /> : null}
								{subjectCity ? <ListForCert title="Город:" value={subjectCity} /> : null}
							</>}
							<ListForCert itemHeader first title={"Издатель " + [cert.selfSigned ? "и владелец" : null]} />
							<ListForCert title="Имя:" value={cert.issuerFriendlyName} />
							{issuerEmail ? <ListForCert title="Email:" value={issuerEmail} /> : null}
							{organizationName ? <ListForCert title="Огранизация:" value={organizationName} /> : null}
							{issuerCountry ? <ListForCert title="Страна:" value={issuerCountry} /> : null}
							{issuerRegion ? <ListForCert title="Регион:" value={issuerRegion} /> : null}
							{issuerCity ? <ListForCert title="Город:" value={issuerCity} /> : null}

							<ListForCert itemHeader title="Сертификат" />
							<ListForCert title="Серийный номер:" value={cert.serialNumber} />
							<ListForCert title="Годен до:" value={cert.notAfter} />
							<ListForCert title="Алгоритм подписи:" value={cert.signatureAlgorithm} />
							<ListForCert title="Хэш-алгоритм:" value={cert.signatureDigestAlgorithm} />
							<ListForCert title="Закрытый ключ:" value={cert.hasPrivateKey ? "присутствует" : "отсутствует"} />
						</List>
					</Content>
					{loader}
						<Modal
							ref={ref => this.modals.basicModal = ref}
							style={styles.modal}
							position={"center"}
							swipeToClose={false}>
							<View style={{ width: "100%" }}>
								{cert.hasPrivateKey ? <>
									<Header
										style={{ backgroundColor: "#be3817", height: "auto", paddingTop: 13 }}>
										<Title style={{ paddingBottom: 13 }}>
											<Text style={{
												color: "white",
												fontSize: 15
											}}>Удалить сертификат с контейнером?</Text>
										</Title>
									</Header>
									<View>
										<List>
											<ListItem last style={{ marginLeft: 0, paddingLeft: 17 }} onPress={() => this.props.deleteCertAction(cert, false, goBack())}>
												<Left>
													<Text style={{ fontSize: 14, color: "grey" }}>Нет</Text>
												</Left>
												<Right>
													<Icon name="ios-arrow-forward-outline"></Icon>
												</Right>
											</ListItem>
											<ListItem last style={{ marginLeft: 0, paddingLeft: 17 }} onPress={() => this.props.deleteCertAction(cert, true, goBack())} >
												<Left>
													<Text style={{ fontSize: 14, color: "grey" }}>Да(не рекомендуется)</Text>
												</Left>
												<Right>
													<Icon name="ios-arrow-forward-outline"></Icon>
												</Right>
											</ListItem>
											<ListItem onPress={() => this.modals.basicModal.close()}>
												<Text style={{ fontSize: 15, width: "100%", height: "100%", textAlign: "center", color: "grey" }}>Отмена</Text>
											</ListItem>
										</List>
									</View>
								</>
									: <>
										<Header
											style={{ backgroundColor: "#be3817", height: 45.7, paddingTop: 13 }}>
											<Title>
												<Text style={{
													color: "white",
													fontSize: 15
												}}>Удалить сертификат?</Text>
											</Title>
										</Header>
										<View>
											<List>
												<ListItem last style={{ marginLeft: 0, paddingLeft: 17 }} onPress={() => this.props.deleteCertAction(cert, false, goBack())} >
													<Left>
														<Text style={{ fontSize: 14, color: "grey" }}>Да</Text>
													</Left>
													<Right>
														<Icon name="ios-arrow-forward-outline"></Icon>
													</Right>
												</ListItem>
												<ListItem onPress={() => this.modals.basicModal.close()}>
													<Text style={{ fontSize: 15, width: "100%", height: "100%", textAlign: "center", color: "grey" }}>Отмена</Text>
												</ListItem>
											</List>
										</View>
									</>}
							</View>
						</Modal>
						{!this.state.loader ?
						<Footer>
							{isCertInContainers === true ?
								<FooterTab>
									<FooterButton title="Установить"
										icon="md-add"
										nav={() => {
											this.setState({ loader: true });
											NativeModules.Wrap_Main.installCertFromContainer(containers, (err) => {
												if (err) {
													showToast("Установка сертификата не удалась");
												} else {
													this.props.readCertKeys();
													this.setState({ loader: false });
													showToast("Сертификат установлен");
													this.props.navigation.goBack("Home");
												}
											});
										}} />
								</FooterTab> :
								<FooterTab>
									<FooterButton title="Экспортировать"
										img={require("../../imgs/ios/export.png")}
										nav={() => navigate("ExportCert", { cert: cert })} />
									<FooterButton title="Удалить"
										img={require("../../imgs/ios/delete.png")}
										nav={() => this.modals.basicModal.open()} />
								</FooterTab>
							}
						</Footer>
						: null
						}
						</>
					: this.chainList()}
			</Container>
		);
	}

	componentDidMount() {
		const { cert } = this.props.navigation.state.params;
		NativeModules.Wrap_Cert.getChainCerts(
			cert.serialNumber,
			cert.category,
			cert.provider,
			(err, chain) => this.setState({ chain: chain }));
	}
}
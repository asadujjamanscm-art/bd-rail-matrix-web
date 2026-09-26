// Canonical Bangladesh Railway eTicket Train Information master list.
// Source basis: official eTicket Train Information page/video supplied by the user.
// Keep this file as the single source of truth for train number/name data.
const TRAINS = [
  [701,'Subarna Express'],[702,'Subarna Express'],[703,'Mahanagar Godhuli'],[704,'Mahanagar Provati'],
  [705,'Ekota Express'],[706,'Ekota Express'],[707,'Tista Express'],[708,'Tista Express'],
  [709,'Parabat Express'],[710,'Parabat Express'],[711,'Upukol Express'],[712,'Upukol Express'],
  [713,'Korotoa Express'],[714,'Korotoa Express'],[715,'Kapotaksha Express'],[716,'Kapotaksha Express'],
  [717,'Joyentika Express'],[718,'Joyentika Express'],[719,'Paharika Express'],[720,'Paharika Express'],
  [721,'Mohanagar Express'],[722,'Mohanagar Express'],[723,'Udayan Express'],[724,'Udayan Express'],
  [725,'Sundarban Express'],[726,'Sundarban Express'],[727,'Rupsha Express'],[728,'Rupsha Express'],
  [729,'Meghna Express'],[730,'Meghna Express'],[731,'Barendra Express'],[732,'Barendra Express'],
  [733,'Titumir Express'],[734,'Titumir Express'],[735,'Agnibina Express'],[736,'Agnibina Express'],
  [737,'Egarosindhur Provati'],[738,'Egarosindhur Godhuli'],[739,'Upaban Express'],[740,'Upaban Express'],
  [741,'Turna Express'],[742,'Turna Express'],[743,'Brahmaputra Express'],[744,'Brahmaputra Express'],
  [745,'Jamuna Express'],[746,'Jamuna Express'],[747,'Simanta Express'],[748,'Simanta Express'],
  [749,'Egarosindhur Godhuli'],[750,'Egarosindhur Godhuli'],[751,'Lalmoni Express'],[752,'Lalmoni Express'],
  [753,'Silkcity Express'],[754,'Silkcity Express'],[755,'Madhumati Express'],[756,'Madhumati Express'],
  [757,'Drutojan Express'],[758,'Drutojan Express'],[759,'Padma Express'],[760,'Padma Express'],
  [761,'Sagardari Express'],[762,'Sagardari Express'],[763,'Chitra Express'],[764,'Chitra Express'],
  [765,'Nilsagar Express'],[766,'Nilsagar Express'],[767,'Dolonchapa Express'],[768,'Dolonchapa Express'],
  [769,'Dhumketu Express'],[770,'Dhumketu Express'],[771,'Rangpur Express'],[772,'Rangpur Express'],
  [773,'Kalni Express'],[774,'Kalni Express'],[775,'Sirajganj Express'],[776,'Sirajganj Express'],
  [777,'Hawr Express'],[778,'Hawr Express'],[779,'Dhalarchar Express'],[780,'Dhalarchar Express'],
  [781,'Kishorganj Express'],[782,'Kishorganj Express'],[783,'Tungipara Express'],[784,'Tungipara Express'],
  [785,'Bijoy Express'],[786,'Bijoy Express'],[787,'Sonar Bangla Express'],[788,'Sonar Bangla Express'],
  [789,'Mohanganj Express'],[790,'Mohanganj Express'],[791,'Banalata Express'],[792,'Banalata Express'],
  [793,'Panchagarh Express'],[794,'Panchagarh Express'],[795,'Benapole Express'],[796,'Benapole Express'],
  [797,'Kurigram Express'],[798,'Kurigram Express'],[799,'Jamalpur Express'],[800,'Jamalpur Express'],
  [801,'Chattala Express'],[802,'Chattala Express'],[803,'Banglabandha Express'],[804,'Banglabandha Express'],
  [805,'Chilahati Express'],[806,'Chilahati Express'],[809,'Burimari Express'],[810,'Burimari Express'],
  [813,"Cox's Bazar Express"],[814,"Cox's Bazar Express"],[815,'Parjotak Express'],[816,'Parjotak Express'],
  [821,'Shaikat Express'],[822,'Probal Express'],[823,'Probal Express'],[824,'Shaikat Express'],
  [825,'Jahanabad Express'],[826,'Jahanabad Express'],[827,'Ruposhi Bangla Express'],[828,'Ruposhi Bangla Express']
];

const TRAIN_BY_NO = new Map(TRAINS.map(([n,name]) => [String(n), name]));

// Direction labels are only UI hints. Train Finder still determines actual direction
// from the live route returned by the route API.
const TRAIN_DIRECTIONS = {
  701:['Chattogram','Dhaka'],702:['Dhaka','Chattogram'],703:['Chattogram','Dhaka'],704:['Dhaka','Chattogram'],
  705:['Dhaka','Panchagarh'],706:['Panchagarh','Dhaka'],707:['Dhaka','Dewanganj Bazar'],708:['Dewanganj Bazar','Dhaka'],
  709:['Dhaka','Sylhet'],710:['Sylhet','Dhaka'],711:['Noakhali','Dhaka'],712:['Dhaka','Noakhali'],
  713:['Santahar','Panchagarh'],714:['Panchagarh','Santahar'],715:['Khulna','Rajshahi'],716:['Rajshahi','Khulna'],
  717:['Dhaka','Sylhet'],718:['Sylhet','Dhaka'],719:['Chattogram','Sylhet'],720:['Sylhet','Chattogram'],
  721:['Chattogram','Dhaka'],722:['Dhaka','Chattogram'],723:['Chattogram','Sylhet'],724:['Sylhet','Chattogram'],
  725:['Khulna','Dhaka'],726:['Dhaka','Khulna'],727:['Khulna','Chilahati'],728:['Chilahati','Khulna'],
  729:['Chattogram','Chandpur'],730:['Chandpur','Chattogram'],731:['Rajshahi','Chilahati'],732:['Chilahati','Rajshahi'],
  733:['Rajshahi','Chilahati'],734:['Chilahati','Rajshahi'],735:['Dhaka','Tarakandi'],736:['Tarakandi','Dhaka'],
  737:['Dhaka','Kishoreganj'],738:['Kishoreganj','Dhaka'],739:['Dhaka','Sylhet'],740:['Sylhet','Dhaka'],
  741:['Chattogram','Dhaka'],742:['Dhaka','Chattogram'],743:['Dhaka','Dewanganj Bazar'],744:['Dewanganj Bazar','Dhaka'],
  745:['Dhaka','Tarakandi'],746:['Tarakandi','Dhaka'],747:['Khulna','Chilahati'],748:['Chilahati','Khulna'],
  749:['Dhaka','Kishoreganj'],750:['Kishoreganj','Dhaka'],751:['Dhaka','Lalmonirhat'],752:['Lalmonirhat','Dhaka'],
  753:['Dhaka','Rajshahi'],754:['Rajshahi','Dhaka'],755:['Dhaka','Rajshahi'],756:['Rajshahi','Dhaka'],
  757:['Dhaka','Panchagarh'],758:['Panchagarh','Dhaka'],759:['Dhaka','Rajshahi'],760:['Rajshahi','Dhaka'],
  761:['Khulna','Rajshahi'],762:['Rajshahi','Khulna'],763:['Khulna','Dhaka'],764:['Dhaka','Khulna'],
  765:['Dhaka','Chilahati'],766:['Chilahati','Dhaka'],767:['Santahar','Dinajpur'],768:['Dinajpur','Santahar'],
  769:['Dhaka','Rajshahi'],770:['Rajshahi','Dhaka'],771:['Dhaka','Rangpur'],772:['Rangpur','Dhaka'],
  773:['Dhaka','Sylhet'],774:['Sylhet','Dhaka'],775:['Sirajganj Bazar','Dhaka'],776:['Dhaka','Sirajganj Bazar'],
  777:['Dhaka','Mohanganj'],778:['Mohanganj','Dhaka'],779:['Dhalarchar','Rajshahi'],780:['Rajshahi','Dhalarchar'],
  781:['Dhaka','Kishoreganj'],782:['Kishoreganj','Dhaka'],783:['Rajbari','Gopalganj'],784:['Gopalganj','Rajbari'],
  785:['Chattogram','Jamalpur'],786:['Jamalpur','Chattogram'],787:['Chattogram','Dhaka'],788:['Dhaka','Chattogram'],
  789:['Dhaka','Mohanganj'],790:['Mohanganj','Dhaka'],791:['Dhaka','Chapainawabganj'],792:['Chapainawabganj','Dhaka'],
  793:['Dhaka','Panchagarh'],794:['Panchagarh','Dhaka'],795:['Benapole','Dhaka'],796:['Dhaka','Benapole'],
  797:['Dhaka','Kurigram'],798:['Kurigram','Dhaka'],799:['Dhaka','Jamalpur'],800:['Jamalpur','Dhaka'],
  801:['Chattogram','Dhaka'],802:['Dhaka','Chattogram'],803:['Dhaka','Panchagarh'],804:['Panchagarh','Dhaka'],
  805:['Dhaka','Chilahati'],806:['Chilahati','Dhaka'],809:['Dhaka','Burimari'],810:['Burimari','Dhaka'],
  813:["Cox's Bazar",'Dhaka'],814:['Dhaka',"Cox's Bazar"],815:["Cox's Bazar",'Dhaka'],816:['Dhaka',"Cox's Bazar"],
  821:["Chattogram","Cox's Bazar"],822:["Cox's Bazar",'Chattogram'],823:['Chattogram',"Cox's Bazar"],824:["Cox's Bazar",'Chattogram'],
  825:['Khulna','Dhaka'],826:['Dhaka','Khulna'],827:['Benapole','Dhaka'],828:['Dhaka','Benapole']
};

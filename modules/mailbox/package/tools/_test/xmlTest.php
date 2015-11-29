<?php
include "../xml/Array2XML.php";
include "../xml/XML2Array.php";

use qd\tools\xml\Array2XML;
use qd\tools\xml\XML2Array;

$a = <<<XML
	<searchRequest toto=\"ee\" titi=\"rr\">
		<offset>0</offset>
		<limit titi=\"rr\">10</limit>
		<sortBy>dateDesc</sortBy>
		<fetch>0</fetch>
		<types>contact</types>
		<query titi=\"123\" tutu=\"turtur\">toto</query>
		<photos>
			<photo mainphoto=\"1\">1.png</photo>
			<photo mainphoto=\"0\"><![CDATA[2.png]]></photo>
			<photo mainphoto=\"0\">3.png</photo>
		</photos>
	</searchRequest>
XML;

$b = <<<XML
	<?xml version="1.0" encoding="UTF-8"?>
	<data>
		<product id="8">
			<description><![CDATA[desc]]></description>
			<longdescription><![CDATA[longdesc]]></longdescription>
			<shortdescription><![CDATA[shortdesc]]></shortdescription>
			<name>some string</name>
			<seo>some-string</seo>
			<ean></ean>
			<producer>
				<name></name>
				<photo>1.png</photo>
			</producer>
			<stock>123</stock>
			<trackstock>0</trackstock>
			<new>0</new>
			<pricewithoutvat>1111</pricewithoutvat>
			<price>1366.53</price>
			<discountpricenetto></discountpricenetto>
			<discountprice></discountprice>
			<vatvalue>23</vatvalue>
			<currencysymbol>PLN</currencysymbol>
			<category>
				<photo>1.png</photo>
				<name>test3</name>
			</category>
			<staticattributes>
				<attributegroup name="attributes group">
					<attribute>
						<name>second</name>
						<description>
							<p>desc2</p>
						</description>
						<file></file>
					</attribute>
					<attribute>
						<name>third</name>
						<description>
							<p>desc3</p>
						</description>
						<file></file>
					</attribute>
				</attributegroup>
			</staticattributes>
			<photos>
				<photo mainphoto="1">1.png</photo>
				<photo mainphoto="0">2.png</photo>
				<photo mainphoto="0">3.png</photo>
			</photos>
		</product>
	</data>
XML;

print "<pre>";
XML2Array::init();
$aArrayResult	= XML2Array::createArray($b);
$aXmlResult		= Array2XML::convert($aArrayResult);
print $aXmlResult."\n\n";
print "<hr>";
$aArrayResult	= XML2Array::createArray($aXmlResult);
$aXmlResult		= Array2XML::convert($aArrayResult);
print $aXmlResult."\n\n";
//var_export(XML2Array::createArray($b));

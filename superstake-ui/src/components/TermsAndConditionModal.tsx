import useAppStore from "../hooks/useAppStore";
import { Modal, ModalTitle } from "./Modal";

const TermsAndConditionModal = () => {
  const setAppStore = useAppStore((s) => s.set);

  const handleClose = () => {
    setAppStore((s) => {
      if (s.modals.showTermsAndConditionModal.isFromAcknowledgeModal) {
        s.modals.showAcknowledgeTermsModal = true;
      }
      s.modals.showTermsAndConditionModal = {
        show: false,
        isFromAcknowledgeModal: false,
      };
    });
  };

  return (
    <Modal onClose={handleClose}>
      <div className="flex flex-col max-w-[480px] m-auto h-full">
        <ModalTitle title="Terms & Conditions" />
        <div className="flex flex-col px-6 pr-2 overflow-y-auto text-justify">
          LAST UPDATED: SEPTEMBER 2023
          <br />
          <br />
          SUPERSTAKESOL IS EXPERIMENTAL AND IS PROVIDED TO YOU ON AN &quot;AS
          IS&quot; AND &quot;AS AVAILABLE&quot; BASIS. YOUR PARTICIPATION IS
          ENTIRELY VOLUNTARY, ANY USE WILL BE AT YOUR OWN RISK, AND WITHOUT
          WARRANTIES BY SUPERSTAKESOL OF ANY KIND.
          <br />
          <br />
          NOTICE ON PROHIBITED USE – US AND OTHER RESTRICTED PERSONS:
          SUPERSTAKESOL.COM, STAKING, VAULTS, AND ANY RELATED SERVICES ARE NOT
          OFFERED TO AND MAY NOT BE USED BY PERSONS OR ENTITIES WHO RESIDE IN,,
          ARE LOCATED IN, ARE INCORPORATED IN, OR HAVE A REGISTERED OFFICE IN
          THE UNITED STATES OF AMERICA (COLLECTIVELY, “US PERSONS”) OR IN ANY
          RESTRICTED TERRITORY, AS DEFINED BELOW (EACH SUCH PERSON OR ENTITY
          FROM A RESTRICTED TERRITORY, A “RESTRICTED PERSON”). WE DO NOT MAKE
          EXCEPTIONS. THEREFORE, IF YOU ARE A US PERSON OR OTHER RESTRICTED
          PERSON, THEN DO NOT ATTEMPT TO USE SUPERSTAKESOL.COM OR ANY RELATED
          SERVICES. USE OF A VIRTUAL PRIVATE NETWORK (“VPN”) OR ANY OTHER
          SIMILAR MEANS INTENDED TO CIRCUMVENT THE RESTRICTIONS SET FORTH HEREIN
          IS PROHIBITED.
          <br />
          <br />
          SUPERSTAKESOL MAY RESTRICT SERVICES, INCLUDING IN CERTAIN
          JURISDICTIONS DUE TO APPLICABLE LAWS, REGULATIONS OR BUSINESS
          CONSIDERATIONS AT ITS SOLE DISCRETION. SUPERSTAKESOL WILL NOT BE
          LIABLE FOR ANY LOSS OR DAMAGE RESULTING FROM THE TEMPORARY OR
          PERMANENT LOSS OF USE TO ANY SERVICE OR RELATED SERVICES.
          <br />
          <br />
          These terms and conditions, together with any documents or terms
          expressly incorporated by reference, which includes any other terms
          and conditions or other agreement that Super Stake Sol (“Super Stake
          Sol” “we” “us” and “our”) posts publicly or makes available to you or
          the company or other legal entity you represent (“you” or “your”)
          (collectively, these “Terms”), are entered into between Super Stake
          Sol and YOU concerning your use of, and access to, Super Stake
          Sol&apos;S websites, including superstakesol.com, mobile applications,
          all associated sites and interfaces linked thereto by Super Stake Sol
          or its affiliates, application programming interfaces (“APIs”) and
          source code (collectively with any materials and services available
          therein, and successor website(s) or application(s) thereto, the
          “Site”).
          <br />
          <br />
          PLEASE READ THESE TERMS CAREFULLY, as these Terms govern your use of
          the Site and access to any and all functionality provided through or
          facilitated by the Site (collectively, the “Services”). These Terms
          expressly cover your rights and obligations, and our disclaimers and
          limitations of legal liability, relating to your use of, and access
          to, the Site and the Services.
          <br />
          <br />
          By selecting the tick box and clicking “Agree”, or through
          acknowledging by any other means or otherwise accessing or using (or,
          following an update to the terms, continuing using) the Site or the
          Services, you accept and agree to be bound by and to comply with these
          Terms, including, without limitation, the mandatory arbitration
          provision in Section 18. If you are a resident of a jurisdiction where
          applicable law prohibits arbitration of disputes, the agreement to
          arbitration in Section 18 will not apply to you but the provisions of
          Section 17 will apply instead. By accessing or using the Site or the
          Services, you understand and agree that Super Stake Sol does not
          provide brokerage, custody, exchange, execution, settlement, or
          clearing services of any kind and is not responsible for the
          brokerage, custody, exchange, execution, settlement, or clearing of
          transaction. Please carefully review the disclosures and disclaimers
          set forth in Sections 12 and 13 in their entirety before using any
          software developed by Super Stake Sol. The information in Sections 12
          and 13 provides important details about the legal obligations
          associated with your use of the Services. IF YOU DO NOT AGREE TO THESE
          TERMS, THEN YOU MUST NOT ACCESS OR USE THE SITE OR SERVICES.
          <br />
          <br />
          <span className="font-bold">1. AGREEMENT TO TERMS</span>
          <br />
          By using our Services, you agree to be bound by these Terms. If you do
          not agree to the Terms, then you must not access or use the Site or
          the Services.
          <br />
          <br />
          <span className="font-bold">
            2. CHANGES TO THESE TERMS OR THE SERVICES
          </span>
          <br />
          We may update the Terms from time to time at our sole discretion. If
          we do, we will let you know by posting the updated Terms on the Site,
          to the App and/or may also send other communications. It&apos;s
          important that you review the Terms whenever we update them or you use
          the Services. If you continue to use the Services after we have posted
          updated Terms it means that you accept and agree to the changes. If
          you don’t agree to be bound by the changes, you may not use the
          Services anymore. Because our Services are evolving over time we may
          change or discontinue all or any part of the Services, at any time and
          without notice, at our sole discretion.
          <br />
          <br />
          <span className="font-bold">3. WHO MAY USE THE SERVICES?</span>
          <br />
          3.1. As a condition to accessing or using the Services or the Site,
          you represent and warrant to Super Stake Sol the following:
          <br />
          <br />
          3.1.1. if you are entering into these Terms as an individual, then you
          are of legal age in the jurisdiction in which you reside and you have
          the legal capacity to enter into these Terms and be bound by them;
          <br />
          <br />
          3.1.2. if you are entering into these Terms as an entity, then you
          must have the legal authority to accept these Terms on that
          entity&apos;S behalf, in which case “you” (except as used in this
          paragraph) will mean that entity;
          <br />
          <br />
          3.1.3. you are not a US Person;
          <br />
          <br />
          3.1.4. you are not a resident, national, or agent of, or incorporated
          in, and do not have a registered office in any of the United States,
          Iran, Cuba, North Korea, Syria, Myanmar, Burma, Crimea, Venezuela,
          Donetsk or Luhansk, any jurisdiction identified by the Financial Task
          Force (&quot;FATF&quot;) for strategic AML/CFT deficiencies and
          included in FATF&apos;s listing of &quot;high risk and other monitored
          jurisdictions&quot; accessible at
          https://www.fatf-gafi.org/content/fatf-gafi/en/publications/High-risk-and-other-monitored-jurisdictions/Increased-monitoring-february-2023.html
          and or any other country or region to which the United States, the
          United Kingdom or the European Union embargoes goods or imposes
          sanctions (collectively, “Restricted Territories”);
          <br />
          <br /> 3.1.5. you are not a member of any sanctions list or equivalent
          maintained by the United States government, the United Kingdom
          government, the European Union, or the United Nations, including
          without limitation the US Office of Foreign Asset Control Specifically
          Designated Nationals and Blocked Persons List, available at
          https://home.treasury.gov/policy-issues/financial-sanctions/specially-designated-
          nationals-and-blocked-persons-list-sdn-human-readable-lists
          (collectively, “Sanctions Lists Persons”);
          <br />
          <br />
          3.1.6. you do not intend to transact with any Restricted Person or
          Sanctions List Person;
          <br />
          <br />
          3.1.7. you do not, and will not, use VPN software or any other privacy
          or anonymization tools or techniques, or other means, to circumvent,
          or attempt to circumvent, any restrictions that apply to the Services;
          and
          <br />
          <br />
          3.1.8. your access to the Services is not (a) prohibited by and does
          not otherwise violate or assist you to violate any domestic or foreign
          law, rule, statute, regulation, by-law, order, protocol, code, decree,
          letter, or another directive, requirement, guidance, or guideline,
          published or in force that applies to or is otherwise intended to
          govern or regulate any person, property, transaction, activity, event
          or other matter, including any rule, letter, order, judgment,
          directive or other requirement, guidance, or guideline issued by any
          domestic or foreign federal, provincial or state, municipal, local or
          other governmental, regulatory, judicial or administrative authority
          having jurisdiction over Super Stake Sol, you, the Site or the
          Services, or as otherwise duly enacted, enforceable by law, the common
          law or equity (collectively, “Applicable Laws”); or (b) contribute to
          or facilitate any illegal activity.
          <br />
          <br />
          3.2. As a condition to accessing or using the Services or the Site,
          you acknowledge, understand, and agree to the following:
          <br />
          <br />
          3.2.1. the Site and the Services are experimental;
          <br />
          <br /> 3.3.2. from time to time the Site and the Services may be
          inaccessible or inoperable for any reason, including, without
          limitation: (a) equipment malfunctions; (b) periodic maintenance
          procedures or repairs that Super Stake Sol or any of its suppliers or
          contractors may undertake from time to time; (c) causes beyond Super
          Stake Sol&apos;S control or that Super Stake Sol could not reasonably
          foresee; (d) disruptions and temporary or permanent unavailability,
          including due to underlying blockchain infrastructure, disruptions,
          unavailability caused by malicious actors or decentralised code
          failure; or (e) unavailability of third-party service providers or
          external partners for any reason;
          <br />
          <br />
          3.2.3. we reserve the right to disable or modify access to the Site
          and the Services at any time in the event of any breach of these
          Terms, including, without limitation, if we reasonably believe any of
          your representations and warranties may be untrue or inaccurate, and
          we will not be liable to you for any losses or damages you may suffer
          as a result of or in connection with the Site or the Services being
          inaccessible to you at any time or for any reason;
          <br />
          <br />
          3.2.4. the Site and the Services may evolve, which means Super Stake
          Sol may apply changes, replace, or discontinue (temporarily or
          permanently) the Services at any time in its sole discretion;
          <br />
          <br />
          3.2.5. the pricing information provided through the Services, and
          available on the Site, does not represent an offer, a solicitation of
          an offer, or any advice regarding, or recommendation to enter into, a
          transaction with Super Stake Sol or any other person;
          <br />
          <br />
          3.2.6. Super Stake Sol does not act as an agent, broker, advisor, or
          in any other capacity for you or any other user of the Site or the
          Services;
          <br />
          <br />
          3.2.7. you are solely responsible for your use of the Services,
          including all of your transfers of cryptocurrencies and other
          blockchain-based assets (collectively, “Digital Assets”);
          <br />
          <br />
          3.2.8. you are solely responsible for maintaining the security and
          confidentiality of your private keys associated with your public
          blockchain address or wallet;
          <br />
          <br />
          3.2.9. to the fullest permitted by Applicable Law, we owe no fiduciary
          duties or liabilities to you or any other party, and to the extent any
          such duties or liabilities may exist at law or in equity, you hereby
          irrevocably disclaim, waive, and eliminate those duties and
          liabilities;
          <br />
          <br />
          3.2.10. you are solely responsible for reporting and paying any taxes
          applicable to your use of the Services;
          <br />
          <br />
          3.2.11. we have no control over, or liability for, the delivery,
          quality, safety, legality, or any other aspect of any Digital Assets
          that you may transfer to or from a third party, and we are not
          responsible for ensuring that an entity with whom you transact
          completes the transaction or is authorised to do so, and if you
          experience a problem with any transactions in Digital Assets using the
          Services, then you bear the entire risk;
          <br />
          <br />
          3.2.12. using this Site and Services has associated risks, including
          potential losses. You understand the code and the risks associated
          with use of this Site and Services, you expressly acknowledge, accept
          and assume any risk or losses resulting from your use of this Site and
          the Services;
          <br />
          <br />
          3.2.13. cryptography is a progressing field with advances in code
          cracking and other technological advancements such as the development
          of quantum computers, which may present risks to Digital Assets and
          the Services, and could result in the theft or loss of your Digital
          Assets. To the extent possible, we intend to update Super Stake Sol
          developed smart contracts related to the Services to account for any
          advances in cryptography and to incorporate additional security
          measures necessary to address risks presented by technological
          advancements, but that intention does not guarantee or otherwise
          ensure full security of the Services, as such you absolve Super Stake
          Sol of any liability in relation to this;
          <br />
          <br />
          3.2.14. Super Stake Sol is not responsible for the operation of the
          blockchain based software and networks underlying the Services, there
          exists no guarantee of the functionality, security or availability of
          that software and network; and
          <br />
          <br />
          3.2.15. you have the knowledge and experience in computer science,
          financial and business matters that are capable of evaluating the
          merits and risks of using Super Stake Sol or the Services, you are
          able to incur a complete loss of monies or amounts paid without
          impairing your financial condition and you are able to bear the entire
          economic risk of using Super Stake Sol or the Services for an
          indefinite period of time.
          <br />
          <br />
          <span className="font-bold">4. NETWORK FEES AND PRICE ESTIMATES</span>
          <br />
          In connection with your use of the Services, you are required to pay
          all fees necessary for interacting with certain blockchain networks,
          including, without limitation, the Solana blockchain. Such fees may
          include “gas” costs, as well as all other fees reflected on the Site
          at the time of your use of the Services, including trading fees and
          network access fees. Affiliates of Super Stake Sol may access and use
          the Services in the ordinary course of its Digital Asset trading
          business and may receive fees in connection therewith. Although we
          attempt to provide accurate fee information, this information reflects
          our estimates of fees, which may vary from the actual fees paid to
          interact with the Solana or other blockchains.
          <br />
          <br />
          <span className="font-bold">
            5. NO PROFESSIONAL ADVICE OR FIDUCIARY DUTIES
          </span>
          <br />
          All information provided in connection with your access and use of the
          Site and the Services is for informational purposes only and should
          not be construed as professional advice. You should not take, or
          refrain from taking, any action based on any information contained on
          the Site or any other information that we make available at any time,
          including, without limitation, blog posts, articles, links to
          third-party content, discord content, news feeds, tutorials, tweets,
          and videos. Before you make any financial, legal, or other decisions
          involving the Services, you should seek independent professional
          advice from an individual who is licensed and qualified in the area
          for which such advice would be appropriate. The Terms are not intended
          to, and do not, create or impose any fiduciary duties on us. You
          further agree that the only duties and obligations that we owe you are
          those set out expressly in these Terms.
          <br />
          <br />
          <span className="font-bold">6. LINKS</span>
          <br />
          The Services provide, or third parties may also provide, links to
          other World Wide Web or accessible sites, applications, or resources.
          You acknowledge and agree that Super Stake Sol is not responsible for
          the availability of such external sites, applications or resources,
          and does not endorse and is not responsible or liable for any content,
          advertising, products, or other materials on or available from such
          sites or resources. You further acknowledge and agree that Super Stake
          Sol shall not be responsible or liable, directly or indirectly, for
          any damage or loss caused or alleged to be caused by or in connection
          with use of or reliance on any such content, goods, or services
          available on or through any such site or resource.
          <br />
          <br />
          <span className="font-bold">
            7. MODIFICATION, SUSPENSION AND TERMINATION
          </span>
          <br />
          We may, at our sole discretion, from time to time and with or without
          prior notice to you, modify, suspend or disable (temporarily or
          permanently) the Services, in whole or in part, for any reason
          whatsoever. Upon termination of your access, your right to use the
          Services will immediately cease. We will not be liable for any losses
          suffered by you resulting from any modification to any Services or
          from any modification, suspension, or termination, for any reason, of
          your access to all or any portion of the Site or the Services. The
          following sections of these Terms will survive any termination of your
          access to the Site or the Services, regardless of the reasons for its
          expiration or termination, in addition to any other provision which by
          law or by its nature should survive: Sections 8, Sections 10 through
          to 17.
          <br />
          <br />
          <span className="font-bold">
            8. GENERAL PROHIBITIONS AND SUPER STAKE SOL&apos;S ENFORCEMENT
            RIGHTS
          </span>
          <br />
          You agree not to do any of the following:
          <br />
          <br />
          (a) post, upload, publish, submit or transmit any User Content that:
          (i) infringes, misappropriates or violates a third party&apos;S
          patent, copyright, trademark, trade secret, moral rights or other
          intellectual property rights, or rights of publicity or privacy; (ii)
          violates, or encourages any conduct that would violate, any applicable
          law or regulation or would give rise to civil liability; (iii) is
          fraudulent, false, misleading or deceptive; (iv) is defamatory,
          obscene, pornographic, vulgar or offensive; (v) promotes
          discrimination, bigotry, racism, hatred, harassment or harm against
          any individual or group; (vi) is violent or threatening or promotes
          violence or actions that are threatening to any person or entity; or
          (vii) promotes illegal or harmful activities or substances;
          <br />
          <br />
          (b) use, display, mirror or frame the Services or any individual
          element within the Services, Super Stake Sol&apos;S name, any Super
          Stake Sol trademark, logo or other proprietary information, or the
          layout and design of any page or form contained on a page, without
          Super Stake Sol&apos;S express written consent;
          <br />
          <br />
          (c) access, tamper with, or use non-public areas of the Services,
          Super Stake Sol&apos;S computer systems, or the technical delivery
          systems of Super Stake Sol&apos;S providers or links;
          <br />
          <br />
          (d) attempt to probe, scan or test the vulnerability of any Super
          Stake Sol system or network or breach any security or authentication
          measures including to harm Super Stake Sol or its users;
          <br />
          <br />
          (e) avoid, bypass, remove, deactivate, impair, descramble or otherwise
          circumvent any technological measure implemented by Super Stake Sol or
          any of Super Stake Sol&apos;S providers or any other third party
          (including another user) to protect the Services;
          <br />
          <br />
          (f) attempt to access or search the Services or download content from
          the Services using any engine, software, tool, agent, device or
          mechanism (including spiders, robots, crawlers, data mining tools or
          the like) other than the software and/or search agents provided by
          Super Stake Sol or other generally available third-party web browsers;
          <br />
          <br />
          (g) send any unsolicited or unauthorised advertising, promotional
          materials, email, junk mail, spam, chain letters or other forms of
          solicitation;
          <br />
          <br />
          (h) use any meta tags or other hidden text or metadata utilising a
          Super Stake Sol trademark, logo URL or product name without Super
          Stake Sol&apos;S express written consent;
          <br />
          <br />
          (i) use the Services, or any portion thereof, for any commercial
          purpose or for the benefit of any third party or in any manner not
          permitted by these Terms;
          <br />
          <br />
          (j) forge any TCP/IP packet header or any part of the header
          information in any email or newsgroup posting, or in any way use the
          Services to send altered, deceptive or false source-identifying
          information;
          <br />
          <br />
          (k) attempt to decipher, decompile, disassemble or reverse engineer
          any of the software used to provide the Services;
          <br />
          <br />
          (l) interfere with, or attempt to interfere with, the access of any
          user, host or network, including, without limitation, sending a virus,
          overloading, flooding, spamming, or mail-bombing the Services;
          <br />
          <br />
          (m) collect or store any personally identifiable information from the
          Services from other users of the Services without their express
          permission;
          <br />
          <br />
          (n) impersonate or misrepresent your affiliation with any person or
          entity;
          <br />
          <br />
          (o) violate any applicable law or regulation; or
          <br />
          <br />
          (p) encourage or enable any other individual to do any of the
          foregoing. Super Stake Sol is not obligated to monitor access to or
          use of the Services or to review or edit any content. However, we have
          the right to do so for the purpose of operating the Services, to
          ensure compliance with these Terms and to comply with applicable law
          or other legal requirements. We reserve the right, but are not
          obligated, to remove or disable access to any content, including User
          Content, at any time and without notice, including, but not limited
          to, if we, at our sole discretion, consider it objectionable or in
          violation of these Terms. We have the right to investigate violations
          of these Terms or conduct that affects the Services. We may also
          consult and cooperate with law enforcement authorities to prosecute
          users who violate the law.
          <br />
          <br />
          <span className="font-bold">9. RISKS</span>
          <br />
          9.1. By utilising the Services or interacting with the Site in any
          way, you represent and warrant that you understand and agree to any
          risks associated with the Services, use of any Third Party services or
          links, cryptographic systems and blockchain-based networks (including,
          without limitation, sudden changes in operating rules, such as those
          commonly referred to as “forks,” and advances in code cracking or
          other technical advancements, such as the development of quantum
          computers, which may materially affect the Services); Digital Assets,
          including the usage and intricacies of native Digital Assets, like
          Solana (SOL); smart contract-based tokens, such as those that follow
          the Solana Token Standard; and systems that interact with
          blockchain-based networks. Super Stake Sol does not own or control any
          of the underlying software through which certain platforms, smart
          contracts and blockchain networks are formed. In general, the software
          underlying blockchain networks, including the Solana blockchains, is
          open source, such that anyone can use, copy, modify, and distribute
          it.
          <br />
          <br />
          9.2. You hereby assume and agree that Super Stake Sol will have no
          responsibility or liability for any risks associated with use of Super
          Stake SOL. You hereby irrevocably waive, release and discharge all
          claims, whether known or unknown to you, against Super Stake Sol, its
          affiliates, and their respective shareholders, members, directors,
          officers, employees, agents, and representatives, suppliers, and
          contractors related to any of the risks set forth in this Section or
          otherwise as set out on the Site, and risks set out on any third party
          pages or products to which this Site utilises.
          <br />
          <br />
          9.3. BY PARTICIPATING, YOU ACCEPT AND ACKNOWLEDGE THAT THERE ARE RISKS
          ASSOCIATED WITH PARTICIPATING INCLUDING, BUT NOT LIMITED TO, LOSS OF
          ALL FUNDS, DE-PEGGING, LIQUIDATION, THE RISK OF BUGS, ERRORS,
          TEMPORARY OR PERMANENT UNAVAILABILITY OF UNDERLYING INFRASTRUCTURE,
          FAILURE OF HARDWARE, SOFTWARE AND INTERNET CONNECTIONS, THE RISK OF
          MALICIOUS SOFTWARE INTRODUCTION, HARMFUL COMPONENTS AND SECURITY RISKS
          DUE TO UNDERLYING INFRASTRUCTURE. YOU ACCEPT AND ACKNOWLEDGE THAT
          SUPER STAKE SOL WILL NOT BE RESPONSIBLE FOR ANY LOSSES, FAILURES,
          DISRUPTIONS, ERRORS, DISTORTIONS, DEFECTS OR DELAYS YOU MAY
          EXPERIENCE, HOWEVER CAUSED.
          <br />
          <br />
          9.4. SUPER STAKE SOL WILL NOT BE RESPONSIBLE OR LIABLE TO YOU FOR ANY
          LOSS AND TAKES NO RESPONSIBILITY FOR, AND WILL NOT BE LIABLE TO YOU
          FOR, ANY USE OF THE SERVICES, INCLUDING BUT NOT LIMITED TO ANY LOSSES,
          DAMAGES OR CLAIMS ARISING FROM: (I) USER ERROR SUCH AS FORGOTTEN
          PASSWORDS, INCORRECTLY CONSTRUCTED TRANSACTIONS, OR MISTYPED WALLET
          ADDRESSES; (II) UNDERLYING INFRASTRUCTURE OR LINKS/USE OF THIRD PARTY
          PRODUCTS (III) SERVER FAILURE OR DATA LOSS; (IV) CRYPTOCURRENCY
          WALLETS OR CORRUPT FILES; (V) UNAUTHORISED ACCESS TO SERVICES; (VI)
          STEPS TAKEN FOR THE BENEFIT OF ALL SUPER STAKE SOL USERS OR FOR THE
          CONTINUATION OF SUPER STAKE SOL; OR (VII) ANY THIRD PARTY ACTIVITIES,
          INCLUDING WITHOUT LIMITATION THE USE OF VIRUSES, PHISHING,
          BRUTEFORCING OR OTHER MEANS OF ATTACK AGAINST ANY BLOCKCHAIN NETWORK
          UNDERLYING THE SERVICES.
          <br />
          <br />
          <span className="font-bold">10. DISCLOSURES; DISCLAIMERS</span>
          <br />
          10.1. Super Stake Sol develops open-source software. Super Stake Sol
          does not operate a Digital Asset or derivatives exchange platform nor
          offer brokerage, legal, advisory, custody, trade execution nor
          clearing services and, therefore, has no oversight, involvement, or
          control concerning your transactions using the Services and receives
          no fees therefrom. All transactions between users of Super Stake
          Sol-developed open-source software are executed peer-to-peer directly
          between the users’ Solana addresses through a smart contract.
          <br />
          <br />
          10.2. You are responsible for complying with Applicable Laws that
          govern your use of Super Stake Sol.
          <br />
          <br />
          10.3. You understand that Super Stake Sol is not registered or
          licensed by any regulatory agency or authority. No regulatory agency
          or authority has reviewed or approved the use of the Super Stake
          Sol-developed open-source software. The Site and the Super Stake
          Sol-developed open-source software does not constitute advice or a
          recommendation concerning any commodity, security, or other Digital
          Asset or instrument. Super Stake Sol is not acting as an investment
          adviser or commodity trading adviser to any person or entity.
          <br />
          <br />
          10.4. Super Stake Sol does not own or control the underlying software
          protocols that are used in connection with staking, leverage, margin
          positions or derivatives or swap contracts or any further Services
          Super Stake Sol provides. In general, the underlying protocols are
          open source and anyone can use, copy, modify, and distribute them.
          Super Stake Sol is not responsible for the operation of the underlying
          protocols, and Super Stake Sol makes no guarantee of their
          functionality, security, or availability.
          <br />
          <br />
          10.5. To the maximum extent permitted under Applicable Law, the Site
          and the Services (and any of their content or functionality) provided
          by or on behalf of us are provided on an “AS IS” and “AS AVAILABLE”
          basis, and we expressly disclaim, and you hereby waive, any
          representations, conditions or warranties of any kind, whether express
          or implied, legal, statutory or otherwise, or arising from statute,
          otherwise in law, course of dealing, or usage of trade, including,
          without limitation, the implied or legal warranties and conditions of
          merchantability, merchantable quality, quality or fitness for a
          particular purpose, title, security, availability, reliability,
          accuracy, quiet enjoyment and non-infringement of third party rights.
          Without limiting the foregoing, we do not represent or warrant that
          the Site or the Services (including any data relating thereto) will be
          uninterrupted, available at any particular time, or error-free.
          Further, we do not warrant that errors in the Site or the Service are
          correctable or will be correctable.
          <br />
          <br />
          10.6. You acknowledge that your data on the Site may become
          irretrievably lost or corrupted or temporarily unavailable due to a
          variety of causes, and agree that, to the maximum extent permitted
          under Applicable Law, we will not be liable for any loss or damage
          caused by denial-of-service attacks, software failures, viruses or
          other technologically harmful materials (including those which may
          infect your computer equipment), protocol changes by third-party
          providers, internet outages, force majeure events or other disasters,
          scheduled or unscheduled maintenance, or other causes either within or
          outside our control.
          <br />
          <br />
          10.7. The disclaimer of implied warranties contained herein may not
          apply if and to the extent such warranties cannot be excluded or
          limited under the Applicable Law of the jurisdiction in which you
          reside.
          <br />
          <br />
          <span className="font-bold">
            11. THIRD PARTY WEBSITES, SERVICES, RESOURCES OR LINKS
          </span>
          <br />
          The Site and Services will allow you to access and/or plug-in to
          third-party websites, services, information or other resources. We
          provide access only as a convenience and are not responsible for the
          content, products or services on or available from those resources,
          services, links or websites. You acknowledge sole responsibility for
          and assume all risk arising from your use and reliance on those
          third-party websites, services or resources.
          <br />
          <br />
          You are expected to have understood and have agreed with any
          additional third party terms and conditions prior to your use
          including any wallets, Drift.trade, Jupiter, Jito Foundation and
          Marinade.finance amongst others.
          <br />
          <br />
          <span className="font-bold">12. INDEMNITY</span>
          <br />
          You will defend, indemnify and hold harmless Super Stake Sol and its
          officers, directors, employees and agents, representatives, suppliers,
          and contractors (collectively, “Indemnified Parties”) from and against
          any claims, disputes, demands, liabilities, damages, losses, and costs
          and expenses, including, without limitation, reasonable legal and
          accounting fees arising out of or in any way connected with (a) your
          access to or use of the Services, (b) your User Content, (c) Digital
          Assets associated with your blockchain address or wallet for which you
          are the/a beneficial owner, (d) any feedback or user content you
          provide to Super Stake Sol, if any, concerning the Site or the
          Services, (e) your infringement or misappropriation of the rights of
          any other person or entity or (c) your violation of these Terms. If
          you are obligated to indemnify any Indemnified Party, Super Stake Sol
          (or, at its discretion, the applicable Indemnified Party) will have
          the right, in its sole discretion, to control any action or proceeding
          and to determine whether Super Stake Sol wishes to settle, and if so,
          on what terms, and you agree to cooperate with Super Stake Sol in the
          defence.
          <br />
          <br />
          <span className="font-bold">
            13. LIMITATION OF LIABILITY AND EXCLUSIONS
          </span>
          <br />
          13.1. TO THE MAXIMUM EXTENT PERMITTED BY LAW, NEITHER SUPER STAKE SOL
          NOR ITS SERVICE PROVIDERS INVOLVED IN CREATING, PRODUCING, OR
          DELIVERING THE SERVICES WILL BE LIABLE FOR ANY LOSSES, INCIDENTAL,
          SPECIAL, EXEMPLARY OR CONSEQUENTIAL DAMAGES, OR DAMAGES FOR LOST
          PROFITS, LOST REVENUES, LOST SAVINGS, LOST BUSINESS OPPORTUNITY, LOSS
          OF DATA OR GOODWILL, SERVICE INTERRUPTION, COMPUTER DAMAGE OR SYSTEM
          FAILURE OR THE COST OF SUBSTITUTE SERVICES OF ANY KIND ARISING OUT OF
          OR IN CONNECTION WITH THESE TERMS OR FROM THE USE OF OR INABILITY TO
          USE THE SERVICES, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING
          NEGLIGENCE), PRODUCT LIABILITY OR ANY OTHER LEGAL THEORY, AND WHETHER
          OR NOT SUPER STAKE SOL OR ITS SERVICE PROVIDERS HAVE BEEN INFORMED OF
          THE POSSIBILITY OF SUCH DAMAGE, EVEN IF A LIMITED REMEDY SET FORTH
          HEREIN IS FOUND TO HAVE FAILED OF ITS ESSENTIAL PURPOSE.
          <br />
          <br />
          13.2. TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL SUPER
          STAKE SOL&apos;S TOTAL LIABILITY ARISING OUT OF OR IN CONNECTION WITH
          THESE TERMS OR FROM THE USE OF OR INABILITY TO USE THE SERVICES EXCEED
          THE AMOUNT OF FEES YOU HAVE PAID TO SUPER STAKE SOL, OR ARE PAYABLE BY
          YOU TO SUPER STAKE SOL FOR USE OF THE SERVICES, OR FIFTY DOLLARS ($50)
          IF YOU HAVE NOT HAD ANY PAYMENT OBLIGATIONS TO SUPER STAKE SOL, AS
          APPLICABLE.
          <br />
          <br />
          13.3. IN NO EVENT WILL SUPER STAKE SOL&apos;S SUPPLIERS AND
          CONTRACTORS (INCLUDING THEIR MEMBERS, DIRECTORS, EMPLOYEES, AGENTS,
          REPRESENTATIVES OR ADVISORS) BE LIABLE FOR ANY INCIDENTAL, INDIRECT,
          SPECIAL, PUNITIVE, CONSEQUENTIAL OR SIMILAR DAMAGES OR LIABILITIES
          WHATSOEVER (INCLUDING LOSSES OF FIAT, ASSETS, DATA, INFORMATION,
          REVENUE, OPPORTUNITIES, USE, GOODWILL, PROFITS OR OTHER BUSINESS OR
          FINANCIAL BENEFIT) ARISING OUT OF OR IN CONNECTION WITH THE SITE AND
          THE SERVICES. 16.4. THE EXCLUSIONS AND LIMITATIONS OF DAMAGES SET
          FORTH ABOVE ARE FUNDAMENTAL ELEMENTS OF THE BASIS OF THE BARGAIN
          BETWEEN SUPER STAKE SOL AND YOU.
          <br />
          <br />
          <span className="font-bold">14. LAW AND FORUM CHOICE</span>
          <br />
          These Terms and any action related thereto will be governed by the
          jurisdiction of the British Virgin Islands, without regard to its
          conflict of laws provisions.
          <br />
          <br />
          Except as otherwise expressly set forth in Section 18 below “Dispute
          Resolution,” the exclusive jurisdiction for all Disputes (defined
          below) that you and Super Stake Sol are required to arbitrate will be
          in Singapore (the seat of arbitration) and the language of the
          arbitration shall be in English, to which you and Super Stake Sol each
          waive any objection to jurisdiction and venue in such courts.
          <br />
          <br />
          <span className="font-bold">15. DISPUTE RESOLUTION</span>
          <br />
          15.1. You agree that if any dispute, claim or controversy arising out
          of or relating to these Terms or the breach, termination, enforcement,
          interpretation or validity thereof or the use of the Services
          (collectively, “Disputes”) cannot be resolved between the parties, it
          will be resolved solely by binding individual arbitration and not in a
          class action, representative or consolidated action or proceeding. You
          and Super Stake Sol each agree to waive the right to a trial by jury
          or to participate in any class action. This arbitration provision
          shall survive termination of these Terms.
          <br />
          <br />
          15.2. Parties must only submit a Dispute to arbitration where there
          has been attempts in good faith to resolve the Dispute and parties
          have not been able to reach an agreement. The arbitration will be
          conducted at the seat of arbitration specified above. A party who
          wishes to undertake arbitration must provide advanced written notice
          to the other party. Payment of all filing, administration and
          arbitrator fees will be governed by the party filing for arbitration.
          <br />
          <br />
          15.3. Any arbitration hearings will be conducted confidentially and
          remotely, to the extent permitted by the relevant seat of arbitration
          rules, unless we both agree to a different location. The parties agree
          that there shall only be one arbritrator and the arbitrator shall have
          exclusive authority to decide all issues relating to the
          interpretation, applicability, enforceability and scope of this
          arbitration agreement.
          <br />
          <br />
          15.4. Both you and Super Stake Sol agree that any claim arising out of
          or related to these Terms or the Services must be filed within one (1)
          year after such claim arose, otherwise the claim is permanently
          barred, which means that you and Super Stake Sol will not have the
          right to assert the claim.
          <br />
          <br />
          <span className="font-bold">16. GENERAL TERMS</span>
          <br />
          16.1. These Terms constitute the entire and exclusive understanding
          and agreement between Super Stake Sol and you regarding the Services,
          and these Terms supersede and replace all prior oral or written
          understandings or agreements between Super Stake Sol and you regarding
          the Services. If any provision of these Terms is held invalid or
          unenforceable by an arbitrator or a court of competent jurisdiction,
          that provision will be enforced to the maximum extent permissible and
          the other provisions of these Terms will remain in full force and
          effect. You may not assign or transfer these Terms, by operation of
          law or otherwise, without Super Stake Sol&apos;S prior written
          consent. Any attempt by you to assign or transfer these Terms, without
          such consent, will be null. Super Stake Sol may freely assign or
          transfer these Terms without restriction. Subject to the foregoing,
          these Terms will bind and inure to the benefit of the parties, their
          successors and permitted assigns.
          <br />
          <br />
          <span className="font-bold">17. CONTACT INFORMATION</span>
          <br />
          If you have any questions about these Terms or the Services, please
          contact Super Stake Sol at superstakesol@gmail.com.
        </div>
      </div>
    </Modal>
  );
};

export default TermsAndConditionModal;

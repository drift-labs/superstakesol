import { useCommonDriftStore } from '@drift-labs/react';
import { useEffect, useRef } from 'react';
import { ALL_LST } from '../constants/lst';
import { UserAccount, decodeName } from '@drift-labs/sdk';
import NOTIFICATION_UTILS from '../utils/notify';
import Link from 'next/link';

const checkForDuplicateSuperstakeAccounts = (accounts: UserAccount[]) => {
	const lstAccountNames = ALL_LST.map((lst) => lst.driftAccountName);

	for (const lstAccountName of lstAccountNames) {
		const matchingAccounts = accounts.filter(
			(account) => decodeName(account.name) === lstAccountName
		);
		if (matchingAccounts.length > 1) {
			return true;
		}
	}

	return false;
};

const useDuplicateAccountWarning = () => {
	const userAccounts = useCommonDriftStore((s) => s.userAccounts);
	const alreadyShownWarning = useRef(false);

	useEffect(() => {
		if (userAccounts.length === 0) return;
		if (alreadyShownWarning.current) return;
		const hasDuplicateAccounts =
			checkForDuplicateSuperstakeAccounts(userAccounts);

		if (hasDuplicateAccounts) {
			NOTIFICATION_UTILS.toast.error(
				<div className="flex flex-col space-y-2">
					<span>
						{`You’ve opened duplicate superstake accounts. This superstake UI can only manage one. You can use the `}
						<Link
							href="https://app.drift.trade"
							target="_blank"
							className="border-b pb-[2px] border-container-border "
						>
							Drift UI
						</Link>
						{` to manage or consolidate them into a single account. If you want more information `}
						<Link
							href="https://superstakesol.notion.site/Fixing-duplicate-superstake-accounts-c35c6231320a40e5a5503cfade448937"
							target="_blank"
							className="border-b pb-[2px] border-container-border "
						>
							we have a guide here.
						</Link>
					</span>
				</div>,
				{
					autoClose: false,
					closeOnClick: false,
				}
			);

			alreadyShownWarning.current = true;
		}
	}, [userAccounts]);
};

export default useDuplicateAccountWarning;

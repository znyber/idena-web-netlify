import {Flex, Link, RadioGroup, Stack} from '@chakra-ui/react'
import {useRouter} from 'next/router'
import {padding} from 'polished'
import {useEffect, useState} from 'react'
import {Trans, useTranslation} from 'react-i18next'
import {useQuery} from 'react-query'
import {BuySharedNodeForm, ChooseItemRadio} from '../../screens/node/components'
import {getProvider} from '../../shared/api'

import {SubHeading, Text} from '../../shared/components'
import {PrimaryButton, SecondaryButton} from '../../shared/components/button'
import {Avatar} from '../../shared/components/components'
import Layout from '../../shared/components/layout'
import {useAuthState} from '../../shared/providers/auth-context'
import {
  apiKeyStates,
  useSettingsState,
} from '../../shared/providers/settings-context'
import theme, {rem} from '../../shared/theme'

const options = {
  PROLONG: 0,
  BUY: 1,
  ENTER_KEY: 2,
}

export default function Restricted() {
  const {apiKeyState, apiKeyData} = useSettingsState()
  const {coinbase} = useAuthState()
  const auth = useAuthState()
  const router = useRouter()
  const {t} = useTranslation()

  const [state, setState] = useState(options.PROLONG)

  const [showDrawer, setShowDrawer] = useState(false)

  const process = () => {
    if (state === options.PROLONG) {
      setShowDrawer(true)
    } else if (state === options.ENTER_KEY) {
      return router.push('/settings/node')
    } else return router.push('/node/rent')
  }

  const {data: provider} = useQuery(
    ['get-provider-by-id', apiKeyData && apiKeyData.provider],
    () => getProvider(apiKeyData && apiKeyData.provider),
    {
      enabled: apiKeyData && !!apiKeyData.provider,
      retry: false,
    }
  )

  useEffect(() => {
    if (
      apiKeyState === apiKeyStates.ONLINE ||
      apiKeyState === apiKeyStates.EXTERNAL
    )
      router.push('/')
  }, [apiKeyState, router])

  useEffect(() => {
    if (provider && !provider.slots) {
      setState(options.BUY)
    }
  }, [provider])

  return (
    <Layout canRedirect={false}>
      <Flex
        style={{backgroundColor: theme.colors.darkGraphite}}
        alignItems="center"
        justifyContent="center"
        height="100%"
        direction="column"
        justify="center"
        flex="1"
      >
        <Flex direction="column" maxWidth={rem(480)}>
          <Flex>
            <Avatar address={auth.coinbase} />
            <Flex
              direction="column"
              justify="center"
              flex="1"
              style={{marginLeft: rem(20)}}
            >
              <SubHeading color="white" css={{wordBreak: 'break-word'}}>
                {auth.coinbase}
              </SubHeading>
            </Flex>
          </Flex>
          <Flex
            direction="column"
            marginTop={rem(theme.spacings.medium24)}
            style={{
              backgroundColor: theme.colors.primary2,
              borderRadius: rem(6),
              ...padding(rem(27), rem(40)),
            }}
          >
            <Flex>
              <Text color={theme.colors.white} fontSize={rem(18)}>
                {t(
                  'You cannot use the shared node for the upcoming validation ceremony'
                )}
              </Text>
            </Flex>

            <Flex marginTop={rem(28)}>
              <Text
                color={theme.colors.white}
                fontSize={rem(11)}
                css={{opacity: 0.5}}
              >
                {t('Choose an option')}
              </Text>
            </Flex>
            <Flex marginTop={rem(15)}>
              <RadioGroup>
                <Stack direction="column" spacing={3}>
                  <ChooseItemRadio
                    isChecked={state === options.PROLONG}
                    onChange={() => setState(options.PROLONG)}
                    isDisabled={provider && !provider.slots}
                  >
                    <Text color={theme.colors.white} fontSize={rem(13)}>
                      {t('Prolong node access')}{' '}
                      {provider ? `(${provider.data.price} iDNA)` : ''}
                    </Text>
                  </ChooseItemRadio>
                  <ChooseItemRadio
                    isChecked={state === options.BUY}
                    onChange={() => setState(options.BUY)}
                  >
                    <Text color={theme.colors.white} fontSize={rem(13)}>
                      {t('Rent another shared node')}
                    </Text>
                  </ChooseItemRadio>
                  <ChooseItemRadio
                    isChecked={state === options.ENTER_KEY}
                    onChange={() => setState(options.ENTER_KEY)}
                  >
                    <Text color={theme.colors.white} fontSize={rem(13)}>
                      {t('Enter shared node API key')}
                    </Text>
                  </ChooseItemRadio>
                </Stack>
              </RadioGroup>
            </Flex>
            <Flex marginTop={rem(20)}>
              <Text
                color={theme.colors.white}
                fontSize={rem(14)}
                css={{marginTop: rem(theme.spacings.small12)}}
              >
                <Trans i18nKey="restrictedDownloadNode" t={t}>
                  <span style={{opacity: 0.5}}>
                    You can run your own node for free at your desktop computer.
                    Download it{' '}
                  </span>{' '}
                  <Link
                    href="https://idena.io/download"
                    target="_blank"
                    rel="noreferrer"
                    color="brandBlue.100"
                  >
                    here
                  </Link>
                  .
                </Trans>
              </Text>
            </Flex>
            <Flex marginTop={rem(30)} style={{marginLeft: 'auto'}}>
              <SecondaryButton onClick={() => router.back()} mr={2}>
                {t('Not now')}
              </SecondaryButton>
              <PrimaryButton onClick={process}>{t('Continue')}</PrimaryButton>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      {provider && (
        <BuySharedNodeForm
          isOpen={showDrawer}
          onClose={() => setShowDrawer(false)}
          providerId={provider.id}
          url={provider.data.url}
          from={coinbase}
          amount={provider.data.price}
          to={provider.data.address}
        />
      )}
    </Layout>
  )
}
